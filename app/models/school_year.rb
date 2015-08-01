class SchoolYear < ActiveRecord::Base
  has_many :attendance_events, -> (student) { extending FindByStudent } do
    def summarize
      { tardies: where(tardy: true).size, absences: where(absence: true).size }
    end
  end
  has_many :discipline_incidents, -> (student) { extending FindByStudent }
  has_many :assessments, -> (student) { extending FindByStudent }
  validates_uniqueness_of :name, :start

  def self.in_between(school_year_1, school_year_2)
    where(start: (school_year_1.start)..(school_year_2.start)).order(:start).reverse
  end

  def events(student)
    {
      attendance_events: attendance_events.find_by_student(student).summarize,
      discipline_incidents: discipline_incidents.find_by_student(student),
      mcas_math_result: assessments.find_by_student(student).where(
        assessment_family_id: AssessmentFamily.mcas.id,
        assessment_subject_id: AssessmentSubject.math.id
      ).last,
      mcas_ela_result: assessments.find_by_student(student).where(
        assessment_family_id: AssessmentFamily.mcas.id,
        assessment_subject_id: AssessmentSubject.ela.id
      ).last,
      star_reading_results: assessments.find_by_student(student).where(
        assessment_family_id: AssessmentFamily.star.id,
        assessment_subject_id: AssessmentSubject.reading.id
      ).order(date_taken: :desc),
      star_math_results: assessments.find_by_student(student).where(
        assessment_family_id: AssessmentFamily.star.id,
        assessment_subject_id: AssessmentSubject.math.id
      ).order(date_taken: :desc)
    }
  end
end
