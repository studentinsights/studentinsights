class DraftQueries
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  def student_drafts_json(student, options = {})
    raise Exceptions::EducatorNotAuthorized unless @authorizer.is_authorized_for_student?(student)

    time_now = options.fetch(:time_now, Time.now)
    draft_expiration_interval = options.fetch(:draft_expiration_interval, 30.days)

    EventNoteDraft.joins(:event_note_completed_drafts)
    EventNoteDraft.joins(:event_note_completed_drafts).where("pets.name != ?", "fluffy")

    EventNoteDraft.left_outer_joins(:event_note_completed_drafts).distinct.select('event_note_drafts.*, COUNT(event_note_drafts_completed.*) AS completd').group('event_note_drafts.id')

    join_sql = """
      LEFT OUTER JOIN event_note_completed_drafts
         ON event_note_drafts.draft_key = event_note_completed_drafts.draft_key
        AND event_note_drafts.student_id = event_note_completed_drafts.student_id
        AND event_note_drafts.educator_id = event_note_completed_drafts.educator_id
    """
    ds = EventNoteDraft.all.joins(join_sql).group('event_note_drafts.id').having('COUNT(event_note_completed_drafts.*) = ?', 0)
      

    User.joins(:pets).where("pets.name != 'fluffy'")
    Client.joins(:orders).where(orders: { created_at: time_range })


    EventNoteDraft.transaction do
      # Find recently completed drafts
      completed_draft_keys = EventNoteCompletedDrafts.all
        .where(student_id: student.id)
        .where(educator_id: @educator.id)
        .where('created_at > ?', time_now - draft_expiration_interval)
        .pluck(:draft_key)

        
      # Purge unfinished drafts, as an optimization for future reads
      EventNoteDraft.where({
        draft_key: completed_draft_keys,
        educator_id: current_educator.id,
        student_id: safe_params[:student_id],
      }).destroy_all

      # If their permissions have changed, guard against being able
      # to read their own older drafts that were marked restricted.
      is_restricted_values = if current_educator.can_view_restricted_notes? then [true, false] else [false] end
      drafts = EventNoteDraft.all
        .where(student_id: safe_params[:student_id])
        .where(educator_id: current_educator.id)
        .where(is_restricted: is_restricted_values)
        .where('created_at > ?', time_now - draft_expiration_interval)

    # Allow serializing restricted data if they have access
    drafts.as_json({
      dangerously_include_restricted_text: current_educator.can_view_restricted_notes?,
      only: [
        :draft_key,
        :student_id,
        :educator_id,
        :event_note_type_id,
        :is_restricted,
        :text,
        :created_at,
        :updated_at
      ]
    })
  end
end