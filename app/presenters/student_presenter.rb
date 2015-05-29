class StudentPresenter < Struct.new(:student)
  delegate :id, :latest_mcas, :latest_star, :attendance_current_year, :first_name, :last_name, :home_language, to: :student
  include DateToSchoolYear
  def full_name
    if first_name.present? && last_name.present?
      first_name + " " + last_name
    else
      first_name || last_name
    end
  end

  def attributes_for_presentation
    [ :sped, :limited_english_proficient ]
  end

  def method_missing(m, *args, &block)
    if attributes_for_presentation.include? m
      case student.send(m)
      when true
        "Yes"
      when false
        "No"
      when nil
        "—"
      end
    else
      raise NoMethodError
    end
  end

  def current_events
    current_school_year = date_to_school_year(Time.new)
    SchoolYear.find{ |year| year.name == current_school_year.name }.events(student)
  end

  def absences_current_year
    current_events[:attendance_events][:absences]
  end

  def tardies_current_year
    current_events[:attendance_events][:tardies]
  end

  def discipline_current_year
    current_events[:discipline_incidents].count
  end

  def absences_warning_level
    5
  end

  def tardies_warning_level
    5
  end

  def discipline_warning_level
    3
  end

  def absences_warning?
    absences_current_year > absences_warning_level
  end

  def tardies_warning?
    tardies_current_year > tardies_warning_level
  end

  def discipline_warning?
    discipline_current_year > discipline_warning_level
  end

end
