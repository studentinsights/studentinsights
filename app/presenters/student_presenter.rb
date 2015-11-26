class StudentPresenter < Struct.new(:student)
  delegate :id, :latest_mcas, :latest_star, :attendance_current_year, :first_name, :last_name, :home_language, to: :student

  def full_name
    if first_name.present? && last_name.present?
      first_name + " " + last_name
    else
      first_name || last_name
    end
  end

  ATTRIBUTES_FOR_PRESENTATION = [
    'plan_504',
    'home_language',
    'limited_english_proficiency',
    'program_assigned',
    'sped_placement',
    'disability',
    'sped_level_of_need',
    'free_reduced_lunch'
  ]

  ATTRIBUTES_FOR_PRESENTATION.each do |attribute|
    define_method attribute do
      handle_none student.send(attribute)
    end
  end

  def handle_none(value)
    value.present? ? value : "—"
  end
end
