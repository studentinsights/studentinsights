class SchoolYear < ActiveRecord::Base
  has_many :attendance_events, -> (student) { extending FindByStudent }
  has_many :discipline_incidents, -> (student) { extending FindByStudent }
  has_many :student_assessments, -> (student) { extending FindByStudent }
  has_many :interventions, -> (student) { extending FindByStudent }
  validates_uniqueness_of :name, :start
  extend DateToSchoolYear
  include FindDataForStudentProfile

  def self.in_between(school_year_1, school_year_2)
    where(start: (school_year_1.start)..(school_year_2.start)).order(:start).reverse
  end

end
