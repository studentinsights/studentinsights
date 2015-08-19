class StudentAssessment < ActiveRecord::Base
  include DateToSchoolYear
  include AssignToSchoolYear
  belongs_to :assessment
  belongs_to :student
  belongs_to :school_year
  before_save :assign_to_school_year
  delegate :family, :subject, to: :assessment
  delegate :grade, to: :student

  def risk_level
    return nil unless assessment.present? && family.present?
    case family
    when "MCAS"
      McasRiskLevel.new(self).risk_level
    when "STAR"
      StarRiskLevel.new(self).risk_level
    else
      nil
    end
  end

  def self.mcas
    return MissingStudentAssessmentCollection.new if Assessment.mcas.is_a? MissingAssessment
    where(assessment_id: Assessment.mcas.id) || MissingStudentAssessmentCollection.new
  end

  def self.star
    star_math_assessment = Assessment.star_math
    star_reading_assessment = Assessment.star_reading
    return MissingStudentAssessmentCollection.new if \
      star_math_assessment.is_a?(MissingAssessment) || star_reading_assessment.is_a?(MissingAssessment)
    star_math_student_assessment = where(assessment_id: star_math_assessment.id)
    star_reading_student_assessment = where(assessment_id: star_reading_assessment.id)
    star_math_student_assessment.merge(star_reading_student_assessment).order_or_missing \
      || MissingStudentAssessmentCollection.new
  end

  def self.map_test
    return MissingStudentAssessmentCollection.new if Assessment.map_test.is_a? MissingAssessment
    where(assessment_id: Assessment.map_test.id) || MissingStudentAssessmentCollection.new
  end

  def self.access
    return MissingStudentAssessmentCollection.new if Assessment.access.is_a? MissingAssessment
    where(assessment_id: Assessment.access.id) || MissingStudentAssessmentCollection.new
  end

  def self.dibels
    return MissingStudentAssessmentCollection.new if Assessment.dibels.is_a? MissingAssessment
    where(assessment_id: Assessment.dibels.id) || MissingStudentAssessmentCollection.new
  end

  def self.math
    return MissingStudentAssessmentCollection.new if Assessment.math.is_a? MissingAssessment
    where(assessment_id: Assessment.math.id) || MissingStudentAssessmentCollection.new
  end

  def self.ela
    return MissingStudentAssessmentCollection.new if Assessment.ela.is_a? MissingAssessment
    where(assessment_id: Assessment.ela.id) || MissingStudentAssessmentCollection.new
  end

  def self.reading
    return MissingStudentAssessmentCollection.new if Assessment.reading.is_a? MissingAssessment
    where(assessment_id: Assessment.reading.id) || MissingStudentAssessmentCollection.new
  end

  def self.find_by_student(student)
    where(student_id: student.id)
  end

  def self.last_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc).last : MissingStudentAssessment.new
  end

  def self.order_or_missing
    order(date_taken: :asc).present? ? order(date_taken: :asc) : MissingStudentAssessmentCollection.new
  end

end
