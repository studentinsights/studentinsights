class SchoolYear < ActiveRecord::Base
  has_many :attendance_events, -> (student) { extending FindByStudent } do
    def summarize
      { tardies: where(tardy: true).size, absences: where(absence: true).size }
    end
  end
  has_many :discipline_incidents, -> (student) { extending FindByStudent }
  has_many :assessments, -> (student) { extending FindByStudent }
  validates_uniqueness_of :name, :start
  include FindDataForStudentProfile
  extend DateToSchoolYear

  def self.in_between(school_year_1, school_year_2)
    where(start: (school_year_1.start)..(school_year_2.start)).order(:start).reverse
  end

  def student_assessments(student)
    assessments.find_by_student(student)
  end

  def assessment_events(student)
    mcas_math_results = mcas_math_results(student_assessments(student))
    mcas_ela_results = mcas_ela_results(student_assessments(student))
    mcas_math_result = mcas_math_results.present? ? mcas_math_results.last : MissingAssessment.new
    mcas_ela_result = mcas_ela_results.present? ? mcas_ela_results.last : MissingAssessment.new
    {
      mcas_math_result: mcas_math_result,
      mcas_ela_result: mcas_ela_result,
      star_reading_results: star_reading_results(student_assessments(student)),
      star_math_results: star_math_results(student_assessments(student))
    }
  end

  def attendance_discipline_events(student)
    {
      attendance_events: attendance_events.find_by_student(student).summarize,
      discipline_incidents: discipline_incidents.find_by_student(student)
    }
  end

  def events(student)
    assessment_events(student).merge(assessment_events(student))
  end
end
