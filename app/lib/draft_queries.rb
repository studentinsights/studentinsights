class DraftQueries
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  def student_drafts_json(student, options = {})
    raise Exceptions::EducatorNotAuthorized unless @authorizer.is_authorized_for_student?(student)

    # If their permissions have changed, guard against being able
    # to read their own older drafts that were marked restricted.
    is_restricted_values = if current_educator.can_view_restricted_notes? then [true, false] else [false] end
    time_now = options.fetch(:time_now, Time.now)
    draft_expiration_interval = options.fetch(:draft_expiration_interval, 30.days)
    drafts = EventNoteDraft.unfinished
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