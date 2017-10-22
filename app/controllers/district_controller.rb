class DistrictController < ApplicationController
  def notes_heatmap
    notes = EventNote
      .where(is_restricted: false)
      .includes(:student)

    # Limit the fields we send down, but include the
    # student's grade.
    serialized_notes = notes.map do |note|
      note.as_json.slice(
        'id',
        'recorded_at',
        'student_id',
        'event_note_type_id'
      ).merge({
        grade: note.student.grade
      })
    end

    @serialized_data ={
      notes: serialized_notes
    }
    render 'shared/serialized_data'
  end
end
