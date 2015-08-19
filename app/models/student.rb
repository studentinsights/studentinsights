class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_events, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :discipline_incidents, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :student_assessments do
    def latest_mcas_math
      mcas_math = Assessment.mcas_math
      return MissingStudentAssessment.new if mcas_math.is_a? MissingAssessment
      where(assessment_id: mcas_math.id).last_or_missing || MissingStudentAssessment.new
    end
    def latest_star_math
      star_math = Assessment.star_math
      return MissingStudentAssessment.new if star_math.is_a? MissingAssessment
      where(assessment_id: star_math.id).last_or_missing || MissingStudentAssessment.new
    end
    def ordered_mcas_math
      mcas_math = Assessment.mcas_math
      return MissingStudentAssessmentCollection.new if mcas_math.is_a? MissingAssessment
      where(assessment_id: mcas_math.id).order_or_missing || MissingStudentAssessmentCollection.new
    end
    def ordered_star_math
      star_math = Assessment.star_math
      return MissingStudentAssessmentCollection.new if star_math.is_a? MissingAssessment
      where(assessment_id: star_math.id).order_or_missing || MissingStudentAssessmentCollection.new
    end
    def latest_mcas_ela
      mcas_ela = Assessment.mcas_ela
      return MissingStudentAssessment.new if mcas_ela.is_a? MissingAssessment
      where(assessment_id: mcas_ela.id).last_or_missing || MissingStudentAssessment.new
    end
    def latest_star_reading
      star_reading = Assessment.star_reading
      return MissingStudentAssessment.new if star_reading.is_a? MissingAssessment
      where(assessment_id: star_reading.id).last_or_missing || MissingStudentAssessment.new
    end
    def ordered_mcas_ela
      mcas_ela = Assessment.mcas_ela
      return MissingStudentAssessmentCollection.new if mcas_ela.is_a? MissingAssessment
      where(assessment_id: mcas_ela.id).order_or_missing || MissingStudentAssessmentCollection.new
    end
    def ordered_star_reading
      star_reading = Assessment.star_reading
      return MissingStudentAssessmentCollection.new if star_reading.is_a? MissingAssessment
      where(assessment_id: star_reading.id).order_or_missing || MissingStudentAssessmentCollection.new
    end
    def dibels
      return MissingStudentAssessmentCollection.new if Assessment.dibels.is_a? MissingAssessment
      where(assessment_id: Assessment.dibels.id).order_or_missing || MissingStudentAssessmentCollection.new
    end
    def access
      star_reading = Assessment.access
      return MissingStudentAssessmentCollection.new if Assessment.access.is_a? MissingAssessment
      where(assessment_id: Assessment.access.id).last_or_missing || MissingStudentAssessmentCollection.new
    end
  end
  has_many :assessments, through: :student_assessments
  has_many :interventions, dependent: :destroy
  has_one :student_risk_level, dependent: :destroy
  validates_presence_of :local_id
  validates_uniqueness_of :local_id
  include DateToSchoolYear

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
    self.risk_level = StudentRiskLevel.new(self).level
    save!
  end

  def self.update_risk_levels
    find_each { |s| s.update_risk_level }
  end

end
