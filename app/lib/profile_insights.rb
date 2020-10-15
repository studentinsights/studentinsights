class ProfileInsights
  def initialize(student, options = {})
    @student = student
    @time_now = options.fetch(:time_now, Time.now)
  end

  # order matters; students > transitions > adult perspectives > other
  def as_json(options = {})
    all_insights = (
      from_somerville_high_student_voice_surveys +
      from_first_transition_note_strength +
      about_team_membership +
      from_bedford_elementary_transition +
      from_bedford_sixth_grade_student_voice_transition_form
    )
    all_insights.as_json(options)
  end

  # From Q2 self-reflection, for showing with grades
  def from_q2_self_reflection
    self_reflection_form = ImportedForm.latest_for_student_id(@student.id, ImportedForm::SHS_Q2_SELF_REFLECTION)
    return [] if self_reflection_form.nil?
    insights_from_generic_imported_form(self_reflection_form)
  end

  private
  # This doesn't pick differently based on the time of year (yet!)
  # Includes:
  # 1. what i want my teachers to know (start of year)
  # 2. Q2 self-reflection
  # 3. what i want my teachers to know (mid-year)
  def from_somerville_high_student_voice_surveys
    insights = []

    # include fall survey insights if there are any
    most_recent_fall_survey = StudentVoiceCompleted2020Survey.most_recent_fall_student_voice_survey(@student.id)
    puts most_recent_fall_survey.present?
    if most_recent_fall_survey.present?
      insights += profile_insights_from_survey(most_recent_fall_survey)
    end

    # add any q2 self reflection, if enabled
    if PerDistrict.new.include_q2_self_reflection_insights?
      insights += from_q2_self_reflection()
    end

    # check for latest mid-year and take if it it's there
    mid_year_form = ImportedForm.latest_for_student_id(@student.id, ImportedForm::SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR)
    if mid_year_form.present?
      insights += insights_from_generic_imported_form(mid_year_form)
    end

    insights
  end

  def from_first_transition_note_strength
    transition_note = @student.transition_notes.find_by(is_restricted: false)
    return [] if transition_note.nil?

    note_parts = TransitionNoteParser.new.parse_text(transition_note.text)
    strengths_quote_text = note_parts[:strengths]
    return [] if strengths_quote_text.nil? || strengths_quote_text.empty?

    transition_note_json = transition_note.as_json({
      only: [:id, :text, :recorded_at],
      include: {
        educator: {
          only: [:id, :full_name, :email]
        }
      }
    })
    profile_insight = ProfileInsight.new(FROM_FIRST_TRANSITION_NOTE_STRENGTH, {
      strengths_quote_text: strengths_quote_text,
      transition_note: transition_note_json
    })
    [profile_insight]
  end

  def about_team_membership
    teams = @student.teams(time_now: @time_now)
    sorted_teams = teams.sort_by(&:season_sort_key)
    sorted_teams.map do |team|
      ProfileInsight.new(ABOUT_TEAM_MEMBERSHIP, team.as_json({
        only: [:activity_text, :coach_text, :season_key, :school_year_text],
        methods: [:active]
      }))
    end
  end

  # For showing the "connecting" as an educator insight
  def from_bedford_elementary_transition
    return [] unless PerDistrict.new.include_bedford_end_of_year_transition?

    prompt = 'Please share anything that helped you connect with this student that might be helpful to the next teacher.'
    form_key = ImportedForm::BEDFORD_DAVIS_TRANSITION_NOTES_FORM
    imported_form = ImportedForm.latest_for_student_id(@student.id, form_key)
    return [] if imported_form.nil?
    insight_text = imported_form.form_json.fetch(prompt, nil)
    return [] unless insight_text.present?

    insight = ProfileInsight.new(FROM_BEDFORD_TRANSITION, {
      insight_text: insight_text,
      form_url: imported_form.form_url,
      educator: imported_form.educator.as_json({
        only: [
          :id,
          :email,
          :full_name
        ]
      })
    })
    [insight]
  end

  def from_bedford_sixth_grade_student_voice_transition_form
    return [] unless PerDistrict.new.include_bedford_end_of_year_transition?

    form_key = ImportedForm::BEDFORD_SIXTH_GRADE_TRANSITION_FORM
    imported_form = ImportedForm.latest_for_student_id(@student.id, form_key)
    return [] if imported_form.nil?

    insights_from_generic_imported_form(imported_form)
  end

  private
  def insights_from_generic_imported_form(imported_form)
    ImportedForm.prompts(imported_form.form_key).map do |prompt_key|
      if imported_form.form_json[prompt_key].nil?
        nil
      else
        ProfileInsight.new(FROM_GENERIC_IMPORTED_FORM, {
          form_key: imported_form.form_key,
          prompt_text: prompt_key,
          response_text: imported_form.form_json[prompt_key],
          flattened_form_json: imported_form.as_flattened_form
        })
      end
    end.compact
  end

  # Unroll each question from the survey into a separate insight
  def profile_insights_from_survey(most_recent_survey)
    survey_insights = []

    prompt_keys_to_include = [
      :learning_style,
      :outside_school_activity,
      :personal_characteristics,
      :three_words
    ]
    prompt_keys_to_include.each do |prompt_key|
      survey_response_text = most_recent_survey[prompt_key].strip
      next if survey_response_text.nil? || survey_response_text == ''

      survey_text = most_recent_survey.flat_text(prompt_keys_to_include: prompt_keys_to_include)
      student_voice_completed_survey_json = most_recent_survey.as_json({
        only: [:id, :form_timestamp, :created_at]
      }).merge(survey_text: survey_text)
      survey_insights << ProfileInsight.new(FROM_FIRST_STUDENT_VOICE_SURVEY, {
        prompt_key: prompt_key,
        prompt_text: StudentVoiceCompleted2020Survey.columns_for_form_2020[prompt_key],
        survey_response_text: survey_response_text,
        student_voice_completed_survey: student_voice_completed_survey_json
      })
    end
    survey_insights
  end

  # See InsightsCarousel.js
  ABOUT_TEAM_MEMBERSHIP = 'about_team_membership'
  FROM_BEDFORD_TRANSITION = 'from_bedford_transition'
  FROM_GENERIC_IMPORTED_FORM = 'from_generic_imported_form'
  FROM_FIRST_TRANSITION_NOTE_STRENGTH = 'from_first_transition_note_strength';
  FROM_FIRST_STUDENT_VOICE_SURVEY = 'from_first_student_voice_survey'
end
