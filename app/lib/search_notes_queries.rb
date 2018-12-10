class SearchNotesQueries
  SCOPE_ALL_STUDENTS = 'SCOPE_ALL_STUDENTS'
  SCOPE_FEED_STUDENTS = 'SCOPE_FEED_STUDENTS'
  SCOPE_MY_NOTES_ONLY = 'SCOPE_MY_NOTES_ONLY'

  MAX_YEARS_BACK = 4
  MAX_LIMIT = 100

  def self.clamped_with_defaults(query = {})
    query.merge({
      scope_key: query[:scope_key] || SearchNotesQueries::SCOPE_ALL_STUDENTS,
      start_time_utc: [query[:start_time_utc], Time.now - MAX_YEARS_BACK.years].max, # clamp
      limit: [query[:limit], MAX_LIMIT].min # clamp
    })
  end

  def initialize(educator)
    @educator = educator
  end

  def query(passed_query = {})
    # Add in defaults
    clamped_query = SearchNotesQueries.clamped_with_defaults(passed_query)

    # query for both the total number of records, and then limit
    # what is actually returned.
    #
    # by deferring the `limit` until after the authorization scoping,
    # this fetches much more data than would be fetched otherwise,
    # and this is a good place to optimize if we need to
    query_scope = authorized_query_scope(clamped_query)
    all_results_size = query_scope.size
    event_notes = query_scope.first(clamped_query[:limit])

    # log
    log_query!(clamped_query, all_results_size)

    # serialize, and return both actual data and metadata about
    # total other records
    event_note_cards_json = event_notes.map {|event_note| FeedCard.event_note_card(event_note) }
    [event_note_cards_json, all_results_size, clamped_query]
  end

  private
  def authorized_query_scope(clamped_query)
    start_time_utc, end_time_utc, scope_key, text, grade, house, event_note_type_id = clamped_query.values_at(*[
      :start_time_utc,
      :end_time_utc,
      :scope_key,
      :text,
      :grade,
      :house,
      :event_note_type_id
    ])

    authorizer = Authorizer.new(@educator)
    authorizer.authorized do
      qs = EventNote.all
        .where(is_restricted: false)
        .where('recorded_at > ?', start_time_utc)
        .where('recorded_at < ?', end_time_utc)
        .order(recorded_at: :desc)
        .includes(:educator, student: [:homeroom, :school])

      # query params
      qs = qs.joins(:student).where(students: {grade: grade}) if grade.present?
      qs = qs.joins(:student).where(students: {house: house}) if house.present?
      qs = qs.where(event_note_type_id: event_note_type_id) if event_note_type_id.present?
      qs = qs.where('to_tsvector(text) @@ plainto_tsquery(?)', text) if text.present?

      # adjust scope
      qs = qs.where(educator_id: @educator.id) if scope_key == SCOPE_MY_NOTES_ONLY
      qs = qs.where(student_id: feed_student_ids(qs)) if scope_key == SCOPE_FEED_STUDENTS

      qs
    end
  end

  # causes more queries
  def feed_student_ids(qs)
    note_student_ids = qs.pluck(:student_id).uniq
    note_students = Student.where(id: note_student_ids)
    feed_students = FeedFilter.new(educator).filter_for_educator(note_students)
    feed_students.pluck(:id)
  end

  # The intention is to avoid logging anything directly tied to a user,
  # but to get coarse information on what kinds of queries, whether they
  # are returning any results, and rough ordering (eg, query order, but only
  # scoped to a date so there's no directly way to connect with webserver
  # logs).
  def log_query!(clamped_query, all_results_size)
    LoggedSearch.create!({
      clamped_query_json: clamped_query.as_json(except: [:start_time_utc, :end_time_utc]).to_json,
      all_results_size: all_results_size,
      search_date: Date.today
    })
  end
end
