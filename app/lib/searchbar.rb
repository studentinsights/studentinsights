# frozen_string_literal: true
class Searchbar
  def self.names_for(educator)
    authorizer = Authorizer.new(educator)
    students = authorizer.authorized { Student.all }
    students.map do |student|
      {
        label: "#{student.first_name} #{student.last_name} - #{student.school.local_id} - #{student.grade}",
        id: student.id
      }
    end
  end
end
