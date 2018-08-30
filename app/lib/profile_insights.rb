class ProfileInsights
  def initialize(student)
    @student = student
  end

  def as_json(options = {})
    transition_note_profile_insights
  end

  def transition_note_profile_insights
    transition_note = @student.transition_notes.find_by(is_restricted: false)
    return [] if transition_note.nil?

    note_parts = TransitionNoteParser.new.parse_text(transition_note.text)
    strengths_quote_text = note_parts[:strengths]
    return [] if strengths_quote_text.nil? || strengths_quote_text.empty?

    profile_insight = ProfileInsight.new('transition_note_strength', {
      strengths_quote_text: strengths_quote_text,
      transition_note: transition_note
    })
    [profile_insight]
  end
end
