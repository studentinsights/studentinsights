class StudentPresenter < Struct.new(:student)
  delegate :id, :latest_mcas, :latest_star, to: :student

  def full_name
    student.first_name + " " + student.last_name
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