class StudentPresenter < Struct.new(:student)

  def full_name
    student.first_name + " " + student.last_name
  end

  def sped
    student.sped ? "Yes" : "No"
  end

  def limited_english_proficient
    student.limited_english_proficient ? "Yes" : "No"
  end
  
end