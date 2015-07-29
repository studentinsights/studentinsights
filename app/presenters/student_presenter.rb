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
    [
      :plan_504,
      :home_language,
      :limited_english_proficiency,
      :program_assigned,
      :sped_placement,
      :disability,
      :sped_level_of_need,
      :free_reduced_lunch
    ]
  end

  def method_missing(m, *args, &block)
    if attributes_for_presentation.include? m
      value = student.send(m)
      !value.nil? ? value : "N/A"
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
