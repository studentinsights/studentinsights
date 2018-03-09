class HomeController < ApplicationController
  # The feed of everything going on with all students the educator has access
  # to view.
  def feed_json
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i

    # Query for different kinds of feed cards, then merge and sort and truncate.
    # This means we'll always slightly overquery, since we don't know how many
    # different bits of information there are across data sources until
    # we query and combine them. Ideally we'd query in parallel but we'd
    # need to push this out to the client to do that (and still would have to
    # delay rendering until both came back and were merged anyway).
    feed = Feed.new(current_educator)
    event_note_cards = feed.event_note_cards(time_now, limit)
    birthday_cards = feed.birthday_cards(time_now, limit, {
      limit: 3,
      days_back: 3,
      days_ahead: 0
    })
    feed_cards = feed.merge_sort_and_limit_cards([
      event_note_cards,
      birthday_cards
    ], limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  # Returns a list of `StudentSectionAssignments` with low grades where
  # the student hasn't been commented on in NGE or 10GE yet.  High-school only.
  # Response should include everything UI needs.
  def unsupported_low_grades_json
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i
    time_threshold = time_now - 30.days
    grade_threshold = 69

    insight = InsightUnsupportedLowGrades.new(current_educator)
    assignments = insight.assignments(time_now, time_threshold, grade_threshold)
    truncated_assignments_json = insight.as_json(assignments.first(limit))
    render json: {
      limit: limit,
      total_count: assignments.size,
      assignments: truncated_assignments_json
    }
  end

  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    Time.at(params_time_now.to_i) unless params_time_now.nil?
    Time.now
  end
end
