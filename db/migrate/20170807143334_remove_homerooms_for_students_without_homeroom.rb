class RemoveHomeroomsForStudentsWithoutHomeroom < ActiveRecord::Migration[5.0]
  def change
    district_name = ENV['DISTRICT_NAME']

    return unless district_name == 'Somerville'

    kinda_fake_homerooms = Homeroom.where("name like ?", "%HOMEROOM%")

    kinda_fake_homerooms.each do |homeroom|
      # unlink all students from homerooms with nil names
      homeroom.students.each do |student|
        student.homeroom_id = nil
        student.save!
      end

      homeroom.destroy!
    end
  end
end
