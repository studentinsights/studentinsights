class AddKeyConstraints < ActiveRecord::Migration[5.2]
  def change
    change_column :courses, :school_id, :integer, null: false

    change_column :event_note_revisions, :student_id, :integer, null: false
    change_column :event_note_revisions, :educator_id, :integer, null: false
    change_column :event_note_revisions, :event_note_type_id, :integer, null: false
    change_column :event_note_revisions, :text, :text, null: false
    change_column :event_note_revisions, :event_note_id, :integer, null: false
    change_column :event_note_revisions, :version, :integer, null: false
    change_column :event_note_revisions, :created_at, :datetime, null: false
    change_column :event_note_revisions, :updated_at, :datetime, null: false

    change_column :event_notes, :student_id, :integer, null: false
    change_column :event_notes, :educator_id, :integer, null: false
    change_column :event_notes, :event_note_type_id, :integer, null: false
    change_column :event_notes, :text, :text, null: false
    change_column :event_notes, :recorded_at, :datetime, null: false
    change_column :event_notes, :created_at, :datetime, null: false
    change_column :event_notes, :updated_at, :datetime, null: false
    change_column :event_notes, :is_restricted, :boolean, null: false

    change_column :iep_documents, :student_id, :integer, null: false

    change_column :interventions, :student_id, :integer, null: false
    change_column :interventions, :intervention_type_id, :integer, null: false
    change_column :interventions, :educator_id, :integer, null: false

    change_column :sections, :course_id, :integer, null: false

    change_column :service_uploads, :uploaded_by_educator_id, :integer, null: false

    change_column :services, :student_id, :integer, null: false
    change_column :services, :recorded_by_educator_id, :integer, null: false
    change_column :services, :service_type_id, :integer, null: false
    change_column :services, :recorded_at, :datetime, null: false
    change_column :services, :date_started, :datetime, null: false
    change_column :services, :created_at, :datetime, null: false
    change_column :services, :updated_at, :datetime, null: false

    change_column :student_assessments, :student_id, :integer, null: false
    change_column :student_assessments, :assessment_id, :integer, null: false

    change_column :students, :local_id, :string, null: false
    change_column :students, :state_id, :string, null: false    
    change_column :students, :school_id, :integer, null: false
    change_column :students, :created_at, :datetime, null: false
    change_column :students, :updated_at, :datetime, null: false
    change_column :students, :first_name, :string, null: false
    change_column :students, :last_name, :string, null: false
  end
end
