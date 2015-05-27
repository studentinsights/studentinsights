module FindByStudent
  def find_by_student(student)
    where(student_id: student.id)
  end
end
