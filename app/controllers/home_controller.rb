class HomeController < ApplicationController
  # The feed of everything going on with all students the educator has access
  # to view.
  def feed_json
    educator = current_educator_or_doppleganger(params[:educator_id])
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i

    # Query for different kinds of feed cards, then merge and sort and truncate.
    # This means we'll always slightly overquery, since we don't know how many
    # different bits of information there are across data sources until
    # we query and combine them. Ideally we'd query in parallel but we'd
    # need to push this out to the client to do that (and still would have to
    # delay rendering until both came back and were merged anyway).
    feed = Feed.new(educator)
    event_note_cards = feed.event_note_cards(time_now, limit)
    birthday_cards = feed.birthday_cards(time_now, limit, {
      limit: 3,
      days_back: 3,
      days_ahead: 0
    })
    incident_cards = if params[:include_incident_cards] || PerDistrict.new.include_incident_cards?
      feed.incident_cards(time_now, limit)
    else
      []
    end
    feed_cards = feed.merge_sort_and_limit_cards([
      event_note_cards,
      birthday_cards,
      incident_cards
    ], limit)

    render json: {
      feed_cards: feed_cards
    }
  end

  # Returns a list of `StudentSectionAssignments` with low grades where
  # the student hasn't been commented on in NGE or 10GE yet.  High-school only.
  # Response should include everything UI needs.
  def students_with_low_grades_json
    educator = current_educator_or_doppleganger(params[:educator_id])
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i
    time_threshold = time_now - 45.days
    grade_threshold = 69

    insight = InsightStudentsWithLowGrades.new(educator)
    students_with_low_grades_json = insight.students_with_low_grades_json(time_now, time_threshold, grade_threshold)
    render json: {
      limit: limit,
      total_count: students_with_low_grades_json.size,
      students_with_low_grades: students_with_low_grades_json.first(limit)
    }
  end

  def students_with_high_absences_json
    educator = current_educator_or_doppleganger(params[:educator_id])
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i
    time_threshold = time_now - 45.days
    absences_threshold = 4

    insight = InsightStudentsWithHighAbsences.new(educator)
    students_with_high_absences_json = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    render json: {
      limit: limit,
      total_count: students_with_high_absences_json.size,
      students_with_high_absences: students_with_high_absences_json.first(limit)
    }
  end

  # Use time from value or fall back to Time.now
  def time_now_or_param(params_time_now)
    if params_time_now.present?
      Time.at(params_time_now.to_i)
    else
      Time.now
    end
  end

  # Allow districtwide admin to dopplegang as another user
  def current_educator_or_doppleganger(params_educator_id)
    if current_educator.districtwide_access && params_educator_id.present?
      Educator.find(params_educator_id)
    else
      current_educator
    end
  end
end
