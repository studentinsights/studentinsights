class ProfileInsights
  def initialize(student)
    @student = student
  end

  def as_json
    student_voice_survey_insights + transition_note_profile_insights
  end

  private
  def transition_note_profile_insights
    transition_note = @student.transition_notes.find_by(is_restricted: false)
    return [] if transition_note.nil?

    note_parts = TransitionNoteParser.new.parse_text(transition_note.text)
    strengths_quote_text = note_parts[:strengths]
    return [] if strengths_quote_text.nil? || strengths_quote_text.empty?

    transition_note_json = transition_note.as_json({
      only: [:id, :text, :educator_id, :created_at],
      includes: {
        educator: {
          only: [:id, :full_name, :email]
        }
      }
    })
    profile_insight = ProfileInsight.new('transition_note_strength', {
      strengths_quote_text: strengths_quote_text,
      transition_note: transition_note_json
    })
    [profile_insight]
  end

  # Take only the most recent surey from the most recent upload
  def student_voice_survey_insights
    most_recent_upload = StudentVoiceSurveyUpload
      .where(completed: true)
      .order(created_at: :desc)
      .limit(1)
      .first
    return [] if most_recent_upload.nil?

    most_recent_survey = most_recent_upload.student_voice_completed_surveys
      .where(student_id: @student.id)
      .order(form_timestamp: :desc)
      .limit(1)
      .first
    return [] if most_recent_survey.nil?

    profile_insights_from_survey(most_recent_survey)
  end

  # Unroll each question from the survey into a separate insight
  def profile_insights_from_survey(most_recent_survey)
    survey_insights = []

    prompt_keys_to_include = [
      :proud,
      :best_qualities,
      :activities_and_interests,
      :nervous_or_stressed,
      :learn_best
    ]
    prompt_keys_to_include.each do |prompt_key|
      survey_response_text = most_recent_survey[prompt_key]
      next if survey_response_text.nil?

      student_voice_completed_survey_json = most_recent_survey.as_json({
        only: [:id, :created_at, :form_timestamp] + prompt_keys_to_include
      })
      survey_insights << ProfileInsight.new('student_voice_survey_response', {
        prompt_key: prompt_key,
        prompt_text: StudentVoiceCompletedSurvey.columns_for_form_v1[prompt_key],
        survey_response_text: survey_response_text,
        student_voice_completed_survey: student_voice_completed_survey_json
      })
    end
    survey_insights
  end
end
