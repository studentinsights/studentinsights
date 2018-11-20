class SearchNotesQueries
  SCOPE_ALL_STUDENTS = 'SCOPE_ALL_STUDENTS'
  SCOPE_FEED_STUDENTS = 'SCOPE_FEED_STUDENTS'
  SCOPE_MY_NOTES_ONLY = 'SCOPE_MY_NOTES_ONLY'

  def self.with_defaults(query = {})
    query.merge({
      from_time: query[:from_time] || Time.now,
      limit: query[:limit] || 20,
      scope_key: query[:scope_key] || SearchNotesQueries::SCOPE_ALL_STUDENTS
    })
  end

  def initialize(educator)
    @educator = educator
  end

  def query(passed_query = {})
    query_with_defaults = SearchNotesQueries.with_defaults(passed_query)

    # query for both the total number of records, and then limit
    # what is actually returned.
    #
    # by deferring the `limit` until after the authorization scoping,
    # this fetches much more data than would be fetched otherwise,
    # and this is a good place to optimize if we need to
    query_scope = authorized_query_scope(query_with_defaults)
    all_results_size = query_scope.size
    event_notes = query_scope.first(query_with_defaults[:limit])

    # serialize, and return both actual data and metadata about
    # total other records
    event_note_cards_json = event_notes.map {|event_note| FeedCard.event_note_card(event_note) }
    [event_note_cards_json, all_results_size, query_with_defaults]
  end

  private
  def authorized_query_scope(query_with_defaults)
    from_time, scope_key, text, grade, house, event_note_type_id = query_with_defaults.values_at(*[
      :from_time, :scope_key, :text, :grade, :house, :event_note_type_id
    ])

    authorizer = Authorizer.new(@educator)
    authorizer.authorized do
      qs = EventNote.all
        .where(is_restricted: false)
        .where('recorded_at < ?', from_time)
        .order(recorded_at: :desc)
        .includes(:educator, student: [:homeroom, :school])

      # query params
      qs = qs.joins(:student).where(students: {grade: grade}) if grade.present?
      qs = qs.joins(:student).where(students: {house: house}) if house.present?
      qs = qs.where(event_note_type_id: event_note_type_id) if event_note_type_id.present?
      qs = qs.where('text LIKE ?', "%#{text}%") if text.present?

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
end