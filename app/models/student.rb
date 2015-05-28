class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_events, dependent: :destroy do
    def sort_by_school_year(student)
      event_hash = {}
      school_years = student.school_years
      school_years.each { |sy| event_hash[sy.name] = sy.attendance_events.find_by_student(student) }
      event_hash
    end
  end
  has_many :discipline_incidents, dependent: :destroy do
    def sort_by_school_year(student)
      event_hash = {}
      school_years = student.school_years
      school_years.each { |sy| event_hash[sy.name] = sy.discipline_incidents.find_by_student(student) }
      event_hash
    end
  end
  has_many :mcas_results, dependent: :destroy
  has_many :star_results, dependent: :destroy
  validates_presence_of :state_id
  validates_uniqueness_of :state_id
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

  def latest_star
    if star_results.present?
      star_results.last
    end
  end

  def latest_mcas
    if mcas_results.present?
      mcas_results.last
    end
  end
end
