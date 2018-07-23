class MigrateProgressNotesToEventNotes < ActiveRecord::Migration[4.2]

  class DeprecatedProgressNotesClass < ActiveRecord::Base
    self.table_name = :progress_notes
    belongs_to :intervention
    belongs_to :educator
  end

  def change
    sst_meeting = EventNoteType.find_by_name('SST Meeting')
    raise "Please run DatabaseConstants.new.seed_for_all_districts!" if sst_meeting.nil?

    DeprecatedProgressNotesClass.find_each do |progress_note|
      student = progress_note.intervention.student
      educator = progress_note.educator

      EventNote.create!(
        student: student,
        educator: educator,
        event_note_type: sst_meeting,
        text: progress_note.content,
        recorded_at: progress_note.created_at
      )
    end

    drop_table :progress_notes
  end

end
