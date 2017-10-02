# frozen_string_literal: true
module SearchbarHelper
  def self.names_for(educator)
    authorized_students = educator.school.students.select do |student|
      educator.is_authorized_for_student(student)
    end

    authorized_students.map do |student|
      {
        label: "#{student.first_name} #{student.last_name} - #{student.school.local_id} - #{student.grade}",
        id: student.id
      }
    end
  end

  def self.names_for_all_students
    Student.with_school.map do |student|
      {
        label: "#{student.first_name} #{student.last_name} - #{student.school.local_id} - #{student.grade}",
        id: student.id
      }
    end
  end
end
