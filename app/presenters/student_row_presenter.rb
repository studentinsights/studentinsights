class StudentRowPresenter < Struct.new :row

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
      handle_none row[attribute]
    end
  end

  def handle_none(value)
    value.present? ? value : "—"
  end

  def risk_level_as_string
    row['level'].nil? ? "N/A" : row['level'].to_s
  end

  def risk_level_css_class_name
    "risk-" + risk_level_as_string.downcase.gsub("/", "")
  end

  def full_name
    first_name = row['first_name']
    last_name = row['last_name']

    if first_name.present? && last_name.present?
      first_name + " " + last_name
    else
      first_name || last_name
    end
  end

end
