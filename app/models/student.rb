class Student < ActiveRecord::Base
  belongs_to :homeroom, counter_cache: true
  belongs_to :school
  has_many :attendance_events, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :discipline_incidents, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :mcas_results, -> { extending SortBySchoolYear }, dependent: :destroy
  has_many :star_results, -> { extending SortBySchoolYear }, dependent: :destroy
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

  def profile_data
    {
      attendance_events: attendance_events.sort_by_school_year,
      discipline_incidents: discipline_incidents.sort_by_school_year,
      mcas_results: mcas_results.order(:date_taken),
      star_results: star_results.order(:date_taken)
    }
  end

  def profile_csv_export
    CSV.generate do |csv|
      csv << ['Attendance']
      csv << ['School Year', 'Absences', 'Tardies']
      profile_data[:attendance_events].each do |k, v|
        number_of_absences = v.where(absence: true).count
        number_of_tardies = v.where(tardy: true).count
        csv << [k, number_of_absences, number_of_tardies]
      end
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
