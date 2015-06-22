class StudentPresenter < Struct.new(:student)
  delegate :id, :latest_mcas, :latest_star, :first_name, :last_name, to: :student

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
end
