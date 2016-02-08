class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :student_school_years
  has_many :student_assessments
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy
  has_many :student_notes
  has_one :student_risk_level, dependent: :destroy

  validates_presence_of :local_id
  validates_uniqueness_of :local_id
  validate :valid_grade

  after_create :update_student_school_years

  VALID_GRADES = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8' ].freeze

  def valid_grade
    errors.add(:grade, "must be a valid grade") unless grade.in?(VALID_GRADES)
  end

  def self.with_school
    where.not(school: nil)
  end

  ## STUDENT ASSESSMENT RESULTS ##

  def latest_result_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .by_family_and_subject(family_name, subject_name)
        .order_by_date_taken_asc
        .last
  end

  def ordered_results_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .by_family_and_subject(family_name, subject_name)
        .order_by_date_taken_asc
  end

  def ordered_results_by_family(family_name)
    self.student_assessments
        .by_family(family_name)
        .order_by_date_taken_asc
  end

  def mcas_math_results
    ordered_results_by_family_and_subject("MCAS", "Math")
  end

  def mcas_ela_results
    ordered_results_by_family_and_subject("MCAS", "ELA")
  end

  def star_reading_results
    ordered_results_by_family_and_subject("STAR", "Reading")
  end

  def star_math_results
    ordered_results_by_family_and_subject("STAR", "Math")
  end

  def dibels
    ordered_results_by_family("DIBELS")
  end

  def access
    ordered_results_by_family("ACCESS")
  end

  def latest_mcas_math
    latest_result_by_family_and_subject("MCAS", "Math") || MissingStudentAssessment.new
  end

  def latest_mcas_ela
    latest_result_by_family_and_subject("MCAS", "ELA") || MissingStudentAssessment.new
  end

  def latest_star_math
    latest_result_by_family_and_subject("STAR", "Math") || MissingStudentAssessment.new
  end

  def latest_star_reading
    latest_result_by_family_and_subject("STAR", "Reading") || MissingStudentAssessment.new
  end

  def update_recent_student_assessments
    update_attributes({
      most_recent_mcas_math_growth: latest_mcas_math.growth_percentile,
      most_recent_mcas_ela_growth: latest_mcas_ela.growth_percentile,
      most_recent_mcas_math_performance: latest_mcas_math.performance_level,
      most_recent_mcas_ela_performance: latest_mcas_ela.performance_level,
      most_recent_mcas_math_scaled: latest_mcas_math.scale_score,
      most_recent_mcas_ela_scaled: latest_mcas_ela.scale_score,
      most_recent_star_reading_percentile: latest_star_reading.percentile_rank,
      most_recent_star_math_percentile: latest_star_math.percentile_rank
    })
  end

  def self.update_recent_student_assessments
    find_each do |student|
      student.update_recent_student_assessments
    end
  end

  def absences_count_by_school_year
    student_school_years.map(&:absences_count)
  end

  def tardies_count_by_school_year
    student_school_years.map(&:tardies_count)
  end

  def discipline_incidents_count_by_school_year
    student_school_years.map(&:discipline_incidents_count)
  end

  def serialized_student_data
    {
      student: self,
      student_assessments: student_assessments,
      star_math_results: star_math_results,
      star_reading_results: star_reading_results,
      mcas_math_results: mcas_math_results,
      mcas_ela_results: mcas_ela_results,
      absences_count_by_school_year: absences_count_by_school_year,
      tardies_count_by_school_year: tardies_count_by_school_year,
      discipline_incidents_by_school_year: discipline_incidents_count_by_school_year,
      school_year_names: student_school_years.pluck(:name),
      interventions: interventions
    }
  end

  def self.with_mcas_math
    where.not(most_recent_mcas_math_performance: nil)
  end

  def self.with_mcas_math_warning
    where(most_recent_mcas_math_performance: 'W')
  end

  def self.with_mcas_ela
    where.not(most_recent_mcas_ela_performance: nil)
  end

  def self.with_mcas_ela_warning
    where(most_recent_mcas_ela_performance: 'W')
  end

  ## SCHOOL YEARS ##

  def earliest_school_year
    return DateToSchoolYear.new(registration_date).convert if registration_date.present?

    # If we don't have a registration date on file from X2, our next best option
    # is to guess that the student started Somerville Public Schools in K.
    # As of May 2105, about 9% of current students are missing a registration date
    # value in X2, mostly students in the high school.
    # We'll also need to handle non-numerical grade levels: KF, PK, SP

    return DateToSchoolYear.new(Time.new - grade.to_i.years).convert
  end

  def current_school_year
    DateToSchoolYear.new(Time.new).convert
  end

  def find_student_school_years
    SchoolYear.in_between(earliest_school_year, current_school_year)
  end

  def most_recent_school_year
    # Default_scope on student school years
    # sorts by recency, with most recent first.
    student_school_years.first
  end

  def update_student_school_years
    find_student_school_years.each do |s|
      StudentSchoolYear.where(student_id: self.id, school_year_id: s.id).first_or_create!
    end
  end

  def self.update_student_school_years
    # This method is meant to be called as a scheduled task.
    # Less expensive than calculating student school years on the fly.
    find_each { |s| s.update_student_school_years }
  end

  def assign_events_to_student_school_years
    # In case you have events that weren't assigned to student
    # school years. (This code is kind of like a migration.)
    [student_assessments, interventions].each do |events|
      events.map do |event|
        event.assign_to_student_school_year
      end
    end
  end

  def self.assign_events_to_student_school_years
    find_each { |s| s.assign_events_to_student_school_years }
  end

  ## RISK LEVELS ##

  def self.update_risk_levels
    # This method is meant to be called daily to
    # check for updates to all student's risk levels
    # and save the results to the do (too expensive
    # to calculate on the fly with each page load).
    find_each { |s| s.update_risk_level }
  end

  def update_risk_level
    if student_risk_level.present?
      student_risk_level.update_risk_level!
    else
      create_student_risk_level!
    end
  end

  ## INTERVENTIONS ##

  def most_recent_atp_hours
    if interventions.most_recent_atp.present?
      interventions.most_recent_atp.number_of_hours
    else
      0
    end
  end

  ## DEMOGRAPHICS ##

  def self.low_income
    where.not(free_reduced_lunch: "Not Eligible")
  end

  def self.not_low_income
    where(free_reduced_lunch: "Not Eligible")
  end

end
