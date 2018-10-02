class EducatorHomeroomKey < ActiveRecord::Migration[5.2]
  def change
    puts "Add new column to Educator table..."
    add_column :educators, :assigned_homeroom_id, :integer
    add_foreign_key :educators, :homerooms, column: 'assigned_homeroom_id'

    puts "Copying references from #{Homeroom.all.size} homeroom records..."
    copied_count = 0
    Homeroom.all.each do |homeroom|
      if homeroom.educator.present?
        homeroom.educator.update!(assigned_homeroom_id: homeroom.id)
        copied_count += 1
      end
    end
    puts "Updated #{copied_count} Educator records."
    puts "Done."
  end
end
