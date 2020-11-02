class ConnectionsController < ApplicationController
  before_action :ensure_feature_enabled_for_district!

  def show_json
    params.require(:school_id)
    params.permit(:time_now)
    school = School.find_by_slug(params[:school_id]) || School.find_by_id(params[:school_id])
    time_now = time_now_or_param(params[:time_now])

    # Authorization
    authorizer = Authorizer.new(current_educator)
    authorized_student_ids = authorizer.authorized { school.students.active }.map(&:id)
    render json: {
      students_with_2020_survey_data: students_with_2020_survey_data_json(authorized_student_ids)
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

  def ensure_feature_enabled_for_district!
    raise Exceptions::EducatorNotAuthorized unless PerDistrict.new.enabled_high_school_levels?
  end

  # At present, similar to the data needed for the levels page, without the level
  # calculation itself. Inlcudes specific answer to 2020 survey
  def students_with_2020_survey_data_json(student_ids)
    cutoff_time = time_now - @time_interval

    # query for absences and discipline events in batch
    absence_counts_by_student_id = Absence
      .where(student_id: student_ids)
      .where('occurred_at >= ?', cutoff_time)
      .group(:student_id)
      .count
    discipline_incident_counts_by_student_id = DisciplineIncident
      .where(student_id: student_ids)
      .where('occurred_at >= ?', cutoff_time)
      .group(:student_id)
      .count

    # query for sections within the current term
    section_ids = Section
      .where(term_local_id: SchoolYear.current_term_local_ids(time_now))
      .pluck(:id)
    student_section_assignments_by_student_id = StudentSectionAssignment
      .includes(section: :course)
      .where(student_id: student_ids)
      .where(section_id: section_ids)
      .group_by(&:student_id)

    # Optimized batch query for latest event_notes
    notes_by_student_id = most_recent_event_notes_by_student_id(student_ids, cutoff_time, notes_query_map)

    # Only include relevant survey answer
    survey_response_by_student_id = StudentVoiceCompleted2020Survey
      .only(:shs_adult, :student_id)
      .where(student_id: student_ids)
      .where('created_at >= ?', cutoff_time)
      .group_by(&:student_id)

    # Serialize student fields
    students_json = students.as_json(only: [
      :id,
      :first_name,
      :last_name,
      :grade,
      :limited_english_proficiency,
      :house,
      :counselor,
      :sped_placement,
      :program_assigned
    ])

    # Merge it all back together
    students_with_2020_survey_data = students_json.map do |student_json|
      student_id = student_json['id']
      student_section_assignments_right_now = student_section_assignments_by_student_id.fetch(student_id, [])
      student_json.merge({
        survey_response: survey_response_by_student_id[student_id],
        absences_count_in_period: absence_counts_by_student_id.fetch(student.id, 0),
        discipline_incident_count_in_period: discipline_incident_counts_by_student_id.fetch(student.id, 0),
        section_assignments_right_now: student_section_assignments_by_student_id.fetch(student.id, []),
        notes: notes_by_student_id[student_id],
        student_section_assignments_right_now: student_section_assignments_right_now.as_json({
          only: [:id, :grade_letter, :grade_numeric],
          include: {
            section: {
              only: [:id, :section_number],
              methods: [:course_description]
            }
          }
        })
      })
    end
    students_with_2020_survey_data.as_json
    end

end
