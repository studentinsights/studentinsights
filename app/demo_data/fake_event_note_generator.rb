class FakeEventNoteGenerator

  def initialize(student)
    @date = DateTime.new(2010, 9, 1)
    @student = student
  end

  def next
    @date += rand(30..60)  # days
    educator = Educator.where(admin: true).first

    return {
      student_id: @student.id,
      educator_id: educator.id,
      event_note_type_id: EventNoteType.all.sample.id,
      recorded_at: @date
    }
  end
end
