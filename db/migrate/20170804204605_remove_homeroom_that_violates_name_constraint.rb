class RemoveHomeroomThatViolatesNameConstraint < ActiveRecord::Migration[5.0]
  def change
    Homeroom.where(name: nil).each do |homeroom|
      # unlink all students from homerooms with nil names
      homeroom.students.each do |student|
        student.homeroom_id = nil
        student.save!
      end

      homeroom.destroy!
    end
  end
end
