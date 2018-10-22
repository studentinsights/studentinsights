class StudentsImporterEllEntryAndTransition < ActiveRecord::Migration[5.2]
  def change
    add_column :students, :ell_entry_date, :date, null: true
    add_column :students, :ell_transition_date, :date, null: true
  end
end
