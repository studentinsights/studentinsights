class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :student_school_years
  has_many :attendance_events, dependent: :destroy
  has_many :discipline_incidents, dependent: :destroy
  has_many :student_assessments
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy
  has_one :student_risk_level, dependent: :destroy
  validates_presence_of :local_id
  validates_uniqueness_of :local_id
  after_create :update_student_school_years

  ## STUDENT ASSESSMENT RESULTS ##

  def latest_result_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .latest
        .by_family_and_subject(family_name, subject_name)
        .first_or_missing
  end

  def ordered_results_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .by_family_and_subject(family_name, subject_name)
        .order_or_missing
  end

  def ordered_results_by_family(family_name)
    self.student_assessments
        .by_family(family_name)
        .order_or_missing
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

  def attendance_events_by_school_year
    Hash[student_school_years.includes(:attendance_events, :school_year).map do |s|
      [s.name, s.attendance_events]
    end]
  end

  def discipline_incidents_by_school_year
    Hash[student_school_years.includes(:discipline_incidents, :school_year).map do |s|
      [s.name, s.discipline_incidents]
    end]
  end

  def attendance_events_school_years
    attendance_events_by_school_year.keys
  end

  def behavior_events_school_years
    discipline_incidents_by_school_year.keys
  end

  ## SCHOOL YEARS ##

  def find_student_school_years
    if registration_date.present? || grade.present?
      if registration_date.present?
        first_school_year = DateToSchoolYear.new(registration_date).convert
      elsif grade.present?
        # If we don't have a registration date on file from X2, our next best option
        # is to guess that the student started Somerville Public Schools in K.
        # As of May 2105, about 9% of current students are missing a registration date
        # value in X2, mostly students in the high school.
        # We'll also need to handle non-numerical grade levels: KF, PK, SP
        first_school_year = DateToSchoolYear.new(Time.new - grade.to_i.years).convert
      end
      current_school_year = DateToSchoolYear.new(Time.new).convert
      SchoolYear.in_between(first_school_year, current_school_year)
    else
      []
    end
  end

  def update_student_school_years
    find_student_school_years.each do |s|
      StudentSchoolYear.where(student_id: self.id, school_year_id: s.id).first_or_create!
    end
  end

  def self.update_student_school_years
    # This method is meant to be called as a scheduled task.
    # Less expensive than sorting attendance events and assessment
    # results into student school years on the fly.
    find_each { |s| s.update_student_school_years }
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

end
