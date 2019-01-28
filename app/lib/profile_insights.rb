class ProfileInsights
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
  end

  def as_json(options = {})
    (student_voice_survey_insights + transition_note_profile_insights + team_membership_insights).as_json(options)
  end

  private
  def transition_note_profile_insights
    transition_note = @student.transition_notes.find_by(is_restricted: false)
    return [] if transition_note.nil?

    note_parts = TransitionNoteParser.new.parse_text(transition_note.text)
    strengths_quote_text = note_parts[:strengths]
    return [] if strengths_quote_text.nil? || strengths_quote_text.empty?

    transition_note_json = transition_note.as_json({
      only: [:id, :text, :created_at],
      include: {
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

  def team_membership_insights
    @student.teams(time_now: @time_now).map do |team|
      ProfileInsight.new('team_membership', team.as_json({
        only: [:activity_text, :coach_text, :season_key, :school_year_text],
        methods: [:active]
      }))
    end
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
      survey_response_text = most_recent_survey[prompt_key].strip
      next if survey_response_text.nil? || survey_response_text == ''

      survey_text = render_survey_as_text(most_recent_survey, prompt_keys_to_include)
      student_voice_completed_survey_json = most_recent_survey.as_json({
        only: [:id, :form_timestamp, :created_at]
      }).merge(survey_text: survey_text)
      survey_insights << ProfileInsight.new('student_voice_survey_response', {
        prompt_key: prompt_key,
        prompt_text: StudentVoiceCompletedSurvey.columns_for_form_v2[prompt_key],
        survey_response_text: survey_response_text,
        student_voice_completed_survey: student_voice_completed_survey_json
      })
    end
    survey_insights
  end

  # what to include?
  #   for mid-year, all
  #   for reflection...
  #     What classes are you doing well in?
  #     Why are you doing well in those classes?
  #     What courses are you struggling in? 
  #     Why are you struggling in those courses?
  #     In the classes that you are struggling in, how can your teachers support you so that your grades, experience, work load, etc, improve?
  #     What other information is important for your teachers to know so that we can support you and your learning? (For example, tutor, mentor, before school HW help, study group, etc)
  def mid_year_insights
    # form_timestamp, form_key, form_url, form_json
    # code validates form_key, defines `prompts` method
    forms = ImportedForm
      .order(form_timestamp: :desc)
      .where(form_key: [
        ImportedForm::SHS_Q2_SELF_REFLECTION,
        ImportedForm::SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR
      ])
      .limit(1)
      .first
    survey = {} # find latest
    flat_survey_json = survey.to_flat_survey_json # id, form_timestamp, survey_text
    
    insights = survey.prompts(profile_insights_only: true).map do |prompt_key, prompt_text|
      survey_response_text = survey.responses_json.fetch(prompt_key, nil)
      student_voice_completed_survey = flat_survey_json
      {
        prompt_key: prompt_key,
        prompt_text: prompt_text,
        survey_response_text: survey_response_text,
        student_voice_completed_survey: student_voice_completed_survey
      }
    end
  end

  def render_survey_as_text(most_recent_survey, prompt_keys_to_include)
    lines = []
    prompt_keys_to_include.each do |prompt_key|
      prompt_text = StudentVoiceCompletedSurvey.columns_for_form_v2[prompt_key]
      response_text = most_recent_survey[prompt_key]
      lines << "#{prompt_text}\n#{response_text}\n"
    end
    lines.join("\n").strip
  end
end
