class MigrateProgressNotesToEventNotes < ActiveRecord::Migration
  def change

    sst_meeting = EventNoteType.find_by_name('SST Meeting')
    raise "Please run DatabaseConstants.new.seed!" if sst_meeting.nil?

    ProgressNote.find_each do |progress_note|
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
