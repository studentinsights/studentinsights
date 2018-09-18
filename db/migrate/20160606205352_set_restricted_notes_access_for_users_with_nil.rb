class SetRestrictedNotesAccessForUsersWithNil < ActiveRecord::Migration[4.2]
  def change
    Educator.find_each do |educator|
      if educator.can_view_restricted_notes.nil?
        educator.can_view_restricted_notes = false
        educator.save
      end
    end
  end
end
