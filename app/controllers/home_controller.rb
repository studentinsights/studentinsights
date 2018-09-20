class HomeController < ApplicationController
  # The feed of everything going on with all students the educator has access
  # to view.
  def feed_json
    view_as_educator = current_educator_or_doppleganger(params[:educator_id])
    time_now = time_now_or_param(params[:time_now])
    limit = params[:limit].to_i

    authorized_students = authorizer.authorized_when_viewing_as(view_as_educator) do
      Feed.students_for_feed(view_as_educator)
    end
    feed = Feed.new(authorized_students)
    feed_cards = feed.all_cards(time_now, limit)
    render json: {
      feed_cards: feed_cards
    }
  end

  # Returns a list of `StudentSectionAssignments` with low grades where
  # the student hasn't been commented on in Insights yet.
  # Somerville-only and SHS only.
  # Response should include everything UI needs.
  def students_with_low_grades_json
    safe_params = params.permit(:educator_id, :time_now, :limit, :event_note_type_ids)
    educator = current_educator_or_doppleganger(safe_params[:educator_id])
    time_now = time_now_or_param(safe_params[:time_now])
    limit = safe_params[:limit].to_i
    time_threshold = time_now - 45.days
    grade_threshold = 69
    event_note_type_ids = safe_params.fetch(:event_note_type_ids, nil)

    insight = InsightStudentsWithLowGrades.new(educator, event_note_type_ids: event_note_type_ids)
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
    time_threshold = InsightStudentsWithHighAbsences.time_threshold_capped_to_school_year(time_now, 45.days)
    absences_threshold = 4

    insight = InsightStudentsWithHighAbsences.new(educator)
    students_with_high_absences_json = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    render json: {
      limit: limit,
      total_students: students_with_high_absences_json.size,
      students_with_high_absences: students_with_high_absences_json.first(limit)
    }
  end

  private
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
    if current_educator.can_set_districtwide_access? && params_educator_id.present?
      Educator.find(params_educator_id)
    else
      current_educator
    end
  end
end
