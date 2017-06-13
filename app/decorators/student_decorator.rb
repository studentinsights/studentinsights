class StudentDecorator < Draper::Decorator
  delegate_all

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

  def as_json_for_star_reading
    HashWithIndifferentAccess.new(as_json.merge(star_reading_results: student.star_reading_results))
  end

  def presentation_for_autocomplete
    {
      label: name_school_grade_snapshot,
      value: id
    }
  end

  def name_school_grade_snapshot
    "#{full_name} - #{school.local_id} - #{grade}"
  end

end
