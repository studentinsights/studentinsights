class AttendanceEvent < ActiveRecord::Base
  belongs_to :student
  belongs_to :school_year
  belongs_to :student_school_year
  before_save :assign_to_school_year
  after_create :assign_to_student_school_year
  validates_presence_of :event_date, :student

  def self.absences
    where(absence: true)
  end

  def self.tardies
    where(tardy: true)
  end

  def self.absences_count
    absences.count
  end

  def self.tardies_count
    tardies.count
  end

  def assign_to_school_year
    self.school_year = DateToSchoolYear.new(event_date).convert
  end

  def assign_to_student_school_year
    self.student_school_year = StudentSchoolYear.where({
      student_id: student.id, school_year_id: school_year.id
    }).first_or_create!
    save
  end

end
