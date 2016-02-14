class FakeNoteGenerator

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
      content: ['We talked with an outside therapist.', 'We talked with the family.'].sample
    }
  end
end
