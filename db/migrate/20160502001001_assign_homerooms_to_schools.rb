class AssignHomeroomsToSchools < ActiveRecord::Migration
  def change
    Homeroom.find_each do |homeroom|
      if homeroom.school.nil?
        school = homeroom.students.try(:first).try(:school)
        homeroom.school = school
        homeroom.save!
      end
    end
  end
end
