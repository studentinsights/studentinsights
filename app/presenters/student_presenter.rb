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
      !value.nil? ? value : "—"
    else
      raise NoMethodError
    end
  end
end
