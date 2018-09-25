class EducatorHomeroomKey < ActiveRecord::Migration[5.2]
  def change
    puts "Add new column to Educator table..."
    add_reference :educators, :homeroom
    add_foreign_key :educators, :homerooms

    puts "Copying references from #{Homeroom.all} homeroom records..."
    copied_count = 0
    Homeroom.all.each do |homeroom|
      if homeroom.educator.present?
        homeroom.educator.update!(homeroom_id: homeroom.id)
        copied_count += 1
      end
    end
    puts "Updated #{copied_count} Educator records."
    puts "Done."
  end
end
