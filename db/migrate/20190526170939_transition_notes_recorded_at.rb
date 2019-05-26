class TransitionNotesRecordedAt < ActiveRecord::Migration[5.2]
  def change
    TransitionNote.all.each do |transition_note|
      transition_note.update!(recorded_at: transition_note.created_at)
    end
  end
end
