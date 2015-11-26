class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_events, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :discipline_incidents, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :student_assessments
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy do
    def most_recent_atp
      where(intervention_type_id: InterventionType.atp.id).order(start_date: :asc).first
    end
  end
  has_one :student_risk_level, dependent: :destroy
  validates_presence_of :local_id
  validates_uniqueness_of :local_id
  after_create { create_student_risk_level! }
  include DateToSchoolYear

  def latest_result_by_family_and_subject(family_name, subject_name)
    self.student_assessments
        .latest
        .by_family_and_subject(family_name, subject_name)
        .first_or_missing
  end

  def ordered_mcas_math
    self.student_assessments
        .by_family_and_subject("MCAS", "Math")
        .order_or_missing
  end

  def ordered_star_math
    self.student_assessments
        .by_family_and_subject("STAR", "Math")
        .order_or_missing
  end

  def ordered_mcas_ela
    self.student_assessments
        .by_family_and_subject("MCAS", "ELA")
        .order_or_missing
  end

  def ordered_star_reading
    self.student_assessments
        .by_family_and_subject("STAR", "Reading")
        .order_or_missing
  end

  def school_years
    if registration_date.present? || grade.present?
      if registration_date.present?
        first_school_year = date_to_school_year(registration_date)
      elsif grade.present?
        # If we don't have a registration date on file from X2, our next best option
        # is to guess that the student started Somerville Public Schools in K.
        # As of May 2105, about 9% of current students are missing a registration date
        # value in X2, mostly students in the high school.
        # We'll also need to handle non-numerical grade levels: KF, PK, SP
        first_school_year = date_to_school_year(Time.new - grade.to_i.years)
      end
      current_school_year = date_to_school_year(Time.new)
      SchoolYear.in_between(first_school_year, current_school_year)
    else
      []
    end
  end

  def update_risk_level
    if student_risk_level.present?
      student_risk_level.update_risk_level!
    else
      create_student_risk_level!
    end
  end

  def most_recent_atp_hours
    if interventions.most_recent_atp.present?
      interventions.most_recent_atp.number_of_hours
    else
      0
    end
  end

  def self.update_risk_levels
    find_each { |s| s.update_risk_level }
  end

end
