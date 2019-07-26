# typed: true
class EnforceNullFalseOnAuthorizationBooleans < ActiveRecord::Migration[4.2]
  def change
    change_column :educators, :schoolwide_access, :boolean, null: false
    change_column :educators, :restricted_to_sped_students, :boolean, null: false
    change_column :educators, :restricted_to_english_language_learners, :boolean, null: false
    change_column :educators, :can_view_restricted_notes, :boolean, null: false
  end
end
