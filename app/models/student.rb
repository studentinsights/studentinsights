class Student < ActiveRecord::Base
  # Model for a student in the district, backed by information in the database.
  # Class methods (self.active) concern collections of students,
  # and instance methods (latest_mcas_mathematics) concern a single student.
  #
  # Contrast with student_row.rb, which represents a row imported from X2,
  # (not necessarily in the database yet).

  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :student_school_years, dependent: :destroy
  has_many :student_assessments, dependent: :destroy
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy
  has_many :event_notes, dependent: :destroy
  has_many :services, dependent: :destroy
  has_many :tardies, dependent: :destroy
  has_many :absences, dependent: :destroy
  has_many :discipline_incidents, dependent: :destroy

  has_one :student_risk_level, dependent: :destroy

  validates_presence_of :local_id
  validates_uniqueness_of :local_id
  validate :valid_grade
  validate :registration_date_cannot_be_in_future

  after_create :update_student_school_years

  VALID_GRADES = [ 'PK', 'KF', '1', '2', '3', '4', '5', '6', '7', '8', 'HS'].freeze

  def valid_grade
    errors.add(:grade, "must be a valid grade") unless grade.in?(VALID_GRADES)
  end

  def registration_date_cannot_be_in_future
    if registration_date && (registration_date > DateTime.now)
      errors.add(:registration_date, "cannot be in future")
    end
  end

  def self.with_school
    where.not(school: nil)
  end

  def self.active
    where(enrollment_status: 'Active')
  end

  def active?
    enrollment_status == 'Active'
  end

  ## ABSENCES / TARDIES ##

  def most_recent_school_year_discipline_incidents_count
    discipline_incidents.where(
      'occurred_at > ?', start_of_this_school_year
    ).count
  end

  def most_recent_school_year_absences_count
    absences.where(
      'occurred_at > ?', start_of_this_school_year
    ).count
  end

  def most_recent_school_year_tardies_count
    tardies.where(
      'occurred_at > ?', start_of_this_school_year
    ).count
  end

  def events
    [
      discipline_incidents,
      absences,
      tardies,
    ].flatten
  end

  def events_by_student_school_years
    events.inject({}) do |memo, event|
      school_year_name = find_school_year_name(event)

      if memo[school_year_name]
        memo[school_year_name] << event
      else
        memo[school_year_name] = [event]
      end

      memo
    end
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

  def mcas_mathematics_results
    ordered_results_by_family_and_subject("MCAS", "Mathematics")
  end

  def mcas_ela_results
    ordered_results_by_family_and_subject("MCAS", "ELA")
  end

  def star_reading_results
    ordered_results_by_family_and_subject("STAR", "Reading")
  end

  def star_math_results
    ordered_results_by_family_and_subject("STAR", "Mathematics")
  end

  def dibels
    ordered_results_by_family("DIBELS")
  end

  def latest_access_results
    return if latest_result_by_family_and_subject('ACCESS', 'Composite').nil?

    access_categories = [ :composite, :comprehension, :literacy, :oral, :listening, :reading, :speaking, :writing, ]

    access_categories.map do |category|
      [category, latest_result_by_family_and_subject('ACCESS', category.to_s.capitalize).try(:performance_level)]
    end.to_h

  end

  def latest_mcas_mathematics
    latest_result_by_family_and_subject("MCAS", "Mathematics") || MissingStudentAssessment.new
  end

  def latest_mcas_ela
    latest_result_by_family_and_subject("MCAS", "ELA") || MissingStudentAssessment.new
  end

  def latest_star_mathematics
    latest_result_by_family_and_subject("STAR", "Mathematics") || MissingStudentAssessment.new
  end

  def latest_star_reading
    latest_result_by_family_and_subject("STAR", "Reading") || MissingStudentAssessment.new
  end

  def update_recent_student_assessments
    update_attributes({
      most_recent_mcas_math_growth: latest_mcas_mathematics.growth_percentile,
      most_recent_mcas_ela_growth: latest_mcas_ela.growth_percentile,
      most_recent_mcas_math_performance: latest_mcas_mathematics.performance_level,
      most_recent_mcas_ela_performance: latest_mcas_ela.performance_level,
      most_recent_mcas_math_scaled: latest_mcas_mathematics.scale_score,
      most_recent_mcas_ela_scaled: latest_mcas_ela.scale_score,
      most_recent_star_reading_percentile: latest_star_reading.percentile_rank,
      most_recent_star_math_percentile: latest_star_mathematics.percentile_rank
    })
  end

  def self.update_recent_student_assessments
    find_each do |student|
      student.update_recent_student_assessments
    end
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

    # As of February 2016, all students in X2 are associated with a grade level.

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
    # and save the results to the db (too expensive
    # to calculate on the fly with each page load).
    find_each { |s| s.update_risk_level }
  end

  def update_risk_level
    if student_risk_level.present?
      student_risk_level.update_risk_level!
    else
      create_student_risk_level!
    end

    # Cache risk level to the student table
    if self.risk_level != student_risk_level.level
      self.risk_level = student_risk_level.level
      self.save
    end
  end

  # SpEd Data as defined by Somerville Schools

  def sped_data
    {
      sped_level: sped_level,
      sped_tooltip_message: sped_tooltip_message,
      sped_bubble_class: sped_bubble_class
    }
  end

  def sped_level
    case self.sped_level_of_need
    when "Low < 2"
      "1"
    when "Low >= 2"
      "2"
    when "Moderate"
      "3"
    when "High"
      "4"
    else
      "—"
    end
  end

  def sped_tooltip_message
    case sped_level
    when "1"
      "#{self.first_name} receives 0-2 hours of special education services per week."
    when "2"
      "#{self.first_name} receives 2-5 hours of special education services per week."
    when "3"
      "#{self.first_name} receives 6-14 hours of special education services per week."
    when "4"
      "#{self.first_name} receives 15+ hours of special education services per week."
    else
      nil
    end
  end

  def sped_bubble_class
    case sped_level
    when "—"
      "sped"
    else
      "warning-bubble sped-risk-bubble tooltip"
    end
  end

  private

    def this_year
      DateTime.now.year
    end

    def august_of_this_year
      DateTime.new(this_year, 8, 1)
    end

    def start_of_this_school_year
      if august_of_this_year > DateTime.now
        DateTime.new(this_year - 1, 8, 1)
      else
        august_of_this_year
      end
    end

    def find_school_year_name(event)
      occurred_at = event.occurred_at
      month = occurred_at.month
      year = occurred_at.year

      if month >= 8
        "#{year}-#{year + 1}"
      elsif month >= 1 && month <= 7
        "#{year - 1}-#{year}"
      end
    end

end
