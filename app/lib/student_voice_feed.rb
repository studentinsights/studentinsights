class StudentVoiceFeed
  def initialize(authorized_students)
    @authorized_students = authorized_students
  end

  # Find all students with cards, so they can link
  # into profile.  Always one one card per day, aligned to end of day
  # so that as more come in during the day it stays pegged as fresh.
  def student_voice_cards(time_now)
    cards_from_imported_forms = student_voice_cards_from_imported_forms(time_now)
    cards_from_surveys = student_voice_cards_from_surveys(time_now)

    # This reads from two different data flows and stores in the db,
    # which are often active at different times of the year.  So it
    # leaves it for callers to sort and limit, rather than processing them
    # to integrate.
    (cards_from_imported_forms + cards_from_surveys)
  end

  private
  # This uniques by (student_id, form_key), taking the most recent
  # by (form_timestamp, updated_at, id).
  #
  # Using Arel.sql is safe for strings without user input, see https://github.com/rails/rails/issues/32995
  # for more background.
  def imported_forms_for_card(time_now)
    ImportedForm
      .where(student_id: @authorized_students.map(&:id))
      .where('form_timestamp < ?', time_now)
      .includes(student: [:homeroom, :school])
      .select(Arel.sql 'DISTINCT ON(CONCAT(form_key, student_id)) form_key, student_id, form_timestamp, updated_at, id')
      .order(Arel.sql 'CONCAT(form_key, student_id), form_key ASC, student_id ASC, form_timestamp DESC, updated_at DESC, id DESC')
      .compact
  end

  # Find all students with cards, so they can link
  # into profile.  Always one one card per day, aligned to end of day
  # so that as more come in during the day it stays pegged as fresh.
  def student_voice_cards_from_imported_forms(time_now)
    imported_forms = imported_forms_for_card(time_now)
    grouped_by_date = imported_forms.group_by {|form| form.form_timestamp.to_date }
    grouped_by_date.map do |date, imported_forms_for_date|
      students = imported_forms_for_date.map(&:student).uniq
      latest_form_timestamp = imported_forms_for_date.map(&:form_timestamp).max
      json = {
        latest_form_timestamp: latest_form_timestamp,
        imported_forms_for_date_count: imported_forms_for_date.size,
        students: students.as_json(only: [:id, :first_name, :last_name])
      }
      FeedCard.new(:student_voice, latest_form_timestamp, json)
    end
  end

  # Find all students with cards across surveys.
  def student_voice_surveys_for_cards(time_now)
    StudentVoiceCompletedSurvey
      .joins(:student_voice_survey_upload)
      .where(student_id: @authorized_students.map(&:id))
      .where('form_timestamp < ?', time_now)
      .where('student_voice_survey_uploads.completed = true')
      .includes(:student_voice_survey_upload, student: [:homeroom, :school])
      .select(Arel.sql 'DISTINCT ON(student_id) student_voice_survey_upload_id, student_id, form_timestamp, student_voice_completed_surveys.updated_at, student_voice_completed_surveys.id')
      .order(Arel.sql 'student_id, student_voice_survey_upload_id DESC, student_id ASC, form_timestamp DESC, student_voice_completed_surveys.updated_at DESC, student_voice_completed_surveys.id DESC')
      .compact
  end

  # Read from fall surveys
  def student_voice_cards_from_surveys(time_now)
    surveys = student_voice_surveys_for_cards(time_now)
    grouped_by_date = surveys.group_by {|survey| survey.form_timestamp.to_date }
    grouped_by_date.map do |date, surveys_for_date|
      students = surveys_for_date.map(&:student).uniq
      latest_form_timestamp = surveys_for_date.map(&:form_timestamp).max
      json = {
        latest_form_timestamp: latest_form_timestamp,
        imported_forms_for_date_count: surveys_for_date.size, # note key
        students: students.as_json(only: [:id, :first_name, :last_name])
      }
      FeedCard.new(:student_voice, latest_form_timestamp, json)
    end
  end
end
