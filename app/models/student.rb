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

  def risk_level
    # As defined by Somerville Public Schools

    if latest_mcas.present? && latest_star.present?
      mcas_math = latest_mcas.math_performance
      mcas_ela = latest_mcas.ela_performance
      star_math = latest_star.math_percentile_rank
      star_ela = latest_star.reading_percentile_rank

      if mcas_math == "W" || mcas_ela == "W" || mcas_math == "F" || mcas_ela == "F" ||
        star_math < 10 || star_ela < 10 || limited_english_proficiency == "Limited"
        3
      elsif mcas_math == "NI" || mcas_ela == "NI" || star_math < 30 || star_ela < 30
        2
      elsif mcas_math == "A" || mcas_ela == "A" || star_math > 85 || star_ela > 85
        0
      else
        1
      end
    end
  end

  def risk_level_words
    case risk_level
    when 0 || 1
      "Low"
    when 2
      "Medium"
    when 3
      "High"
    when nil
      "N/A"
    end
  end

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
      mcas_results: mcas_results.order(date_taken: :desc),
      star_results: star_results.order(date_taken: :desc)
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
      csv << []
      csv << ['Behavior']
      csv << ['Date', 'Number of Discipline Incidents']
      profile_data[:discipline_incidents].each do |k, v|
        number_of_discipline_incidents = v.count
        csv << [k, number_of_discipline_incidents]
      end
      csv << []
      csv << ['MCAS']
      csv << ['Date', 'Math Score', 'Math Growth', 'Math Performance',
              'ELA Score', 'ELA Growth', 'ELA Performance']
      profile_data[:mcas_results].each do |mcas|
        csv << [mcas.date_taken, mcas.math_scaled, mcas.math_growth, mcas.math_performance,
                mcas.ela_scaled, mcas.ela_growth, mcas.ela_performance]
      end
      csv << []
      csv << ['STAR']
      csv << ['Date', 'Math Percentile', 'Reading Percentile',
              'Instructional Reading Level']
      profile_data[:star_results].each do |star|
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
