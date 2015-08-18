class SchoolYear < ActiveRecord::Base
  has_many :attendance_events, -> (student) { extending FindByStudent } do
    def summarize
      { tardies: where(tardy: true).size, absences: where(absence: true).size }
    end
  end
  has_many :discipline_incidents, -> (student) { extending FindByStudent }
  has_many :student_assessments, -> (student) { extending FindByStudent }
  validates_uniqueness_of :name, :start
  extend DateToSchoolYear
  include FindDataForStudentProfile

  def self.in_between(school_year_1, school_year_2)
    where(start: (school_year_1.start)..(school_year_2.start)).order(:start).reverse
  end

  def assessment_events(student)
    {
      mcas_math_result: mcas_math_result(student),
      mcas_ela_result: mcas_ela_result(student),
      star: star(student).group_by { |result| result.date_taken },
      dibels: dibels(student),
      access: access(student)
    }
  end

  def attendance_discipline_events(student)
    incidents = discipline_incidents.find_by_student(student)
    return {
      attendance_events_summary: attendance_events.find_by_student(student).summarize,
      discipline_incidents: incidents,
      discipline_incidents_count: incidents.count
    }
  end

  def events(student)
    assessment_events(student).merge(attendance_discipline_events(student))
  end
end
