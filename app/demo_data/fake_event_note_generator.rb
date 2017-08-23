class FakeEventNoteGenerator

  def initialize(student)
    @date = DateTime.new(2010, 9, 1)
    @student = student
  end

  def sample_text
    [
      'Meredith is setting up a family meeting to discuss absences and tardies, and to follow up on concerns about supporting morning routines at home.',
      "Meetings with staff about lack of academic progress.",
      "Engagement issues in ELA, sometimes shutting down altogether and refusing to engage in academic work.  Other times this is more disruptive, lashing out and yelling at other students and interfering with their learning.",
      "#{@student.first_name} will go through the special ed process for placement",
      "Lila will look into a referral to a big sister program.",
      "Philis is meeting with parent next week and will present an attendance contract.",
      "Not engaged in academic work and misbehaving in class.  There have been meetings between the teacher and support staff, and Sam has talked with #{@student.first_name} twice this week.  Philis following up with outside providers as well."
    ].sample
  end

  def next
    @date += rand(30..60)  # days
    educator = Educator.where(admin: true).first

    return {
      student_id: @student.id,
      educator_id: educator.id,
      event_note_type_id: EventNoteType.all.sample.id,
      recorded_at: @date,
      text: sample_text,
      is_restricted: false
    }
  end
end
