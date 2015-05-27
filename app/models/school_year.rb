class SchoolYear < ActiveRecord::Base
  has_many :attendance_events, -> (student) { extending FindByStudent } do
    def summarize
      { tardies: where(tardy: true).size, absences: where(absence: true).size }
    end
  end
  has_many :discipline_incidents, -> (student) { extending FindByStudent }
  validates_uniqueness_of :name, :start

  def self.in_between(school_year_1, school_year_2)
    where(start: (school_year_1.start)..(school_year_2.start)).order(:start).reverse
  end

  def events(student)
    {
      attendance_events: attendance_events.find_by_student(student).summarize,
      discipline_incidents: discipline_incidents.find_by_student(student)
    }
  end
end
