class HomeController < ApplicationController
  # The feed of everything going on with all students the educator has access
  # to view.
  def feed_json
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i

    # query for different kinds of feed cards, then merge and sort and truncate.
    # this means we'll always overquery, since we don't know how many
    # different bits of information there are across data sources until
    # we query and combine them. ideally we'd query in parallel but would
    # need to push this out to the client to do that.
    feed = Feed.new(current_educator)
    event_note_cards = feed.event_note_cards(time_now, limit)
    birthday_cards = feed.birthday_cards(time_now, limit)
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
    time_threshold = time_now - 30.days
    grade_threshold = 69

    insight = InsightUnsupportedLowGrades.new(current_educator)
    assignments = insight.assignments(time_now, time_threshold, grade_threshold)
    assignments_json = insight.as_json(assignments)
    render json: {
      assignments: assignments_json
    }
  end

  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    Time.at(params_time_now.to_i) unless params_time_now.nil?
    Time.now
  end
end
