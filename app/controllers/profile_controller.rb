class ProfileController < ApplicationController
  include ApplicationHelper

  before_action :authorize!

  def json
    student = authorized { Student.find(params[:id]) }
    authorized_sections = authorized { Section.all }
    chart_data = StudentProfileChart.new(student).chart_data

    render json: {
      current_educator: current_educator.as_json(methods: [:labels]),
      student: serialize_student_for_profile(student),          # School homeroom, most recent school year attendance/discipline counts
      feed: student_feed(student),
      chart_data: chart_data,                                   # STAR, MCAS, discipline, attendance charts
      dibels: student.dibels_results.as_json(only: [:id, :date_taken, :benchmark]),
      f_and_p_assessments: student.f_and_p_assessments.as_json(only: [:id, :benchmark_date, :instructional_level, :f_and_p_code]),
      service_types_index: ServiceSerializer.service_types_index,
      educators_index: Educator.to_index,
      access: student.access,
      teams: teams_json(student),
      ed_plans: ed_plans_json(student),
      profile_insights: ProfileInsights.new(student).as_json,
      grades_reflection_insights: ProfileInsights.new(student).from_q2_self_reflection.as_json,
      latest_iep_document: student.latest_iep_document.as_json(only: [:id]),
      sections: serialize_student_sections_for_profile(student),
      current_educator_allowed_sections: authorized_sections.map(&:id),
      attendance_data: {
        discipline_incidents: discipline_incidents_as_json(student),
        tardies: filtered_events(student.tardies),
        absences: filtered_events(student.absences)
      }
    }
  end

  def reader_profile_json
    student = Student.find(params[:id])
    json = ReaderProfile.new(student, s3: s3).reader_profile_json
    render json: json
  end

  def educators_with_access_json
    raise Exceptions::EducatorNotAuthorized unless current_educator.labels.include?('enable_viewing_educators_with_access_to_student')

    student = Student.find(params[:id])
    active_educators = Educator.active.includes(:educator_labels, :school, {sections: :course}, {homeroom: [:school, :students]})

    with_access = []
    active_educators.each do |educator|
      authorizer = Authorizer.new(educator)
      reason = authorizer.why_authorized_for_student?(student)
      if reason.present?
        with_access << {
          educator: educator.as_json(only: [:id, :email, :full_name]),
          reason: reason
        }
      end
    end
    render json: {
      with_access_json: with_access
    }
  end

  private
  def authorize!
    student = Student.find(params[:id])
    raise Exceptions::EducatorNotAuthorized unless current_educator.is_authorized_for_student(student)
  end

  def serialize_student_for_profile(student)
    # These are serialized, even if importing these is disabled
    # and the value is nil.
    per_district_fields = {
      house: student.house,
      counselor: student.counselor,
      sped_liaison: student.sped_liaison,
      ell_entry_date: student.ell_entry_date,
      ell_transition_date: student.ell_transition_date
    }

    json = student.as_json({
      methods: [:has_photo],
      include: {
        homeroom: {
          only: [:id, :name],
          include: {
            educator: {only: [:id, :full_name, :email]}
          }
        },
        school: {
          only: [:id, :name, :local_id, :school_type]
        }
      }
    })

    json.merge(per_district_fields).merge({
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      school_local_id: student.try(:school).try(:local_id), # deprecated, use school
      school_name: student.try(:school).try(:name), # deprecated, use school
      school_type: student.try(:school).try(:school_type), # deprecated, use school
      homeroom_name: student.try(:homeroom).try(:name) # deprecated, use homeroom
    }).stringify_keys
  end

  # Include all courses, not just in the current term.
  # Allow access to this data based on student-level authorization,
  # not on whether the educator can access information about the Section
  # itself.
  def serialize_student_sections_for_profile(student)
    student.sections.select('sections.*, student_section_assignments.grade_numeric').as_json({
      include: {
        educators: {only: :full_name}
      },
      methods: :course_description
    })
  end

  def student_feed(student)
    {
      event_notes: student.event_notes
        .map {|event_note| EventNoteSerializer.safe(event_note).serialize_event_note },
      transition_notes: student.transition_notes,
      second_transition_notes: student.second_transition_notes.as_json({
        except: [:restricted_text],
        methods: [:has_restricted_text]
      }),
      fall_student_voice_surveys: fall_student_voice_surveys_json(student.id),
      homework_help_sessions: student.homework_help_sessions.as_json(except: [:course_ids], methods: [:courses]),
      flattened_forms: flattened_forms_json(student.id),
      bedford_end_of_year_transitions: bedford_end_of_year_transitions(student.id),
      services: {
        active: student.services.active.map {|service| ServiceSerializer.new(service).serialize_service },
        discontinued: student.services.discontinued.map {|service| ServiceSerializer.new(service).serialize_service }
      },
      deprecated: {
        interventions: student.interventions.map { |intervention| DeprecatedInterventionSerializer.new(intervention).serialize_intervention }
      }
    }
  end

  def teams_json(student)
    return [] unless ENV.fetch('SHOULD_SHOW_TEAM_ICONS', false)
    student.teams.as_json({
      only: [:activity_text, :coach_text, :season_key, :school_year_text],
      methods: [:active]
    })
  end

  def filtered_events(mixed_events, options = {})
    time_now = options.fetch(:time_now, Time.now)
    months_back = options.fetch(:months_back, 48)
    cutoff_time = time_now - months_back.months
    mixed_events.where('occurred_at >= ? ', cutoff_time).order(occurred_at: :desc)
  end

  def discipline_incidents_as_json(student, options = {})
    time_now = options.fetch(:time_now, Time.now)
    limit = options.fetch(:limit, 100)
    incident_cards = Feed.new([student]).incident_cards(time_now, limit)
    incident_cards.map {|incident_card| incident_card.json }
  end

  def ed_plans_json(student)
    student.ed_plans.active.includes(:ed_plan_accommodations).as_json(include: :ed_plan_accommodations)
  end

  def flattened_forms_json(student_id)
    form_keys = [
      ImportedForm::SHS_Q2_SELF_REFLECTION,
      ImportedForm::SHS_WHAT_I_WANT_MY_TEACHER_TO_KNOW_MID_YEAR
    ]
    imported_forms = form_keys.map do |form_key|
      ImportedForm.latest_for_student_id(student_id, form_key)
    end
    imported_forms.compact.map(&:as_flattened_form)
  end

  def fall_student_voice_surveys_json(student_id)
    most_recent_survey = StudentVoiceCompletedSurvey.most_recent_fall_student_voice_survey(student_id)
    return [] if most_recent_survey.nil?
    [most_recent_survey].as_json(methods: [:flat_text])
  end

  def bedford_end_of_year_transitions(student_id)
    return [] unless PerDistrict.new.include_bedford_end_of_year_transition?

    form_key = ImportedForm::BEDFORD_DAVIS_TRANSITION_NOTES_FORM
    imported_form = ImportedForm.latest_for_student_id(student_id, form_key)
    return [] if imported_form.nil?
    json = imported_form.as_json({
      except: [:form_url], # defensive against overly permissions on the form itself
      include: {
        educator: {
          only: [:id, :email, :full_name]
        }
      }
    })
    [json]
  end

  def s3
    @client ||= MockAwsS3.create_real_or_mock
  end
end
