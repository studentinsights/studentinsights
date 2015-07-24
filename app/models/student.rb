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

  def chart_data
    {
      attendance_series_absences: attendance_series_absences,
      attendance_series_tardies: attendance_series_tardies,
      attendance_events_school_years: attendance_events_school_years,
      behavior_series: behavior_series,
      behavior_series_school_years: behavior_series_school_years,
      star_series_math_percentile: star_series_math_percentile,
      star_series_reading_percentile: star_series_reading_percentile,
      mcas_series_math_scaled: mcas_series_math_scaled,
      mcas_series_ela_scaled: mcas_series_ela_scaled,
      mcas_series_math_growth: mcas_series_math_growth,
      mcas_series_ela_growth: mcas_series_ela_growth
    }
  end

  def csv_export_data
    {
      attendance_events: attendance_events.sort_by_school_year,
      discipline_incidents: discipline_incidents.sort_by_school_year,
      mcas_results: mcas_results.order(date_taken: :desc),
      star_results: star_results.order(date_taken: :desc)
    }
  end

  def star_series_math_percentile
    star_results.order(date_taken: :asc).map do |s|
      [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.math_percentile_rank ]
    end
  end

  def star_series_reading_percentile
    star_results.order(date_taken: :asc).map do |s|
      [ s.date_taken.year, s.date_taken.month, s.date_taken.day, s.reading_percentile_rank ]
    end
  end

  def mcas_series_math_scaled
    mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.math_scaled ]
    end
  end

  def mcas_series_ela_scaled
    mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.ela_scaled ]
    end
  end

  def mcas_series_math_growth
    mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.math_growth ]
    end
  end

  def mcas_series_ela_growth
    mcas_results.order(date_taken: :asc).map do |m|
      [ m.date_taken.year, m.date_taken.month, m.date_taken.day, m.ela_growth ]
    end
  end

  def attendance_series_absences
    attendance_events.sort_by_school_year.values.map { |v| v.select(:absence).size }.reverse
  end

  def attendance_series_tardies
    attendance_events.sort_by_school_year.values.map { |v| v.select(:tardy).size }.reverse
  end

  def attendance_events_school_years
    attendance_events.sort_by_school_year.keys.reverse
  end

  def behavior_series
    discipline_incidents.sort_by_school_year.values.map { |v| v.size }.reverse
  end

  def behavior_series_school_years
    discipline_incidents.sort_by_school_year.keys.reverse
  end

  def profile_csv_export
    CSV.generate do |csv|
      csv << ['Attendance']
      csv << ['School Year', 'Absences', 'Tardies']
      csv_export_data[:attendance_events].each do |k, v|
        number_of_absences = v.where(absence: true).count
        number_of_tardies = v.where(tardy: true).count
        csv << [k, number_of_absences, number_of_tardies]
      end
      csv << []
      csv << ['Behavior']
      csv << ['Date', 'Number of Discipline Incidents']
      csv_export_data[:discipline_incidents].each do |k, v|
        number_of_discipline_incidents = v.count
        csv << [k, number_of_discipline_incidents]
      end
      csv << []
      csv << ['MCAS']
      csv << ['Date', 'Math Score', 'Math Growth', 'Math Performance',
              'ELA Score', 'ELA Growth', 'ELA Performance']
      csv_export_data[:mcas_results].each do |mcas|
        csv << [mcas.date_taken, mcas.math_scaled, mcas.math_growth, mcas.math_performance,
                mcas.ela_scaled, mcas.ela_growth, mcas.ela_performance]
      end
      csv << []
      csv << ['STAR']
      csv << ['Date', 'Math Percentile', 'Reading Percentile',
              'Instructional Reading Level']
      csv_export_data[:star_results].each do |star|
        csv << [star.date_taken, star.math_percentile_rank, star.reading_percentile_rank,
                star.instructional_reading_level]
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
