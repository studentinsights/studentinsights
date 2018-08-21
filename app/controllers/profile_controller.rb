class ProfileController < ApplicationController
  include ApplicationHelper

  before_action :authorize!

  def json
    student = Student.find(params[:id])
    chart_data = StudentProfileChart.new(student).chart_data
    can_see_transition_notes = current_educator.is_authorized_to_see_transition_notes

    render json: {
      current_educator: current_educator.as_json(methods: [:labels]),
      student: serialize_student_for_profile(student),          # School homeroom, most recent school year attendance/discipline counts
      feed: student_feed(student, restricted_notes: false),     # Notes, services
      chart_data: chart_data,                                   # STAR, MCAS, discipline, attendance charts
      dibels: student.dibels_results.select(:id, :date_taken, :benchmark),
      service_types_index: ServiceSerializer.service_types_index,
      educators_index: Educator.to_index,
      access: student.latest_access_results,
      transition_notes: (can_see_transition_notes ? student.transition_notes : []),
      iep_document: student.iep_document,
      sections: serialize_student_sections_for_profile(student),
      current_educator_allowed_sections: current_educator.allowed_sections.map(&:id),
      attendance_data: {
        discipline_incidents: student.discipline_incidents.order(occurred_at: :desc),
        tardies: student.tardies.order(occurred_at: :desc),
        absences: student.absences.order(occurred_at: :desc)
      }
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
      sped_liaison: student.sped_liaison
    }

    student.as_json.merge(per_district_fields).merge({
      has_photo: (student.student_photos.size > 0),
      absences_count: student.most_recent_school_year_absences_count,
      tardies_count: student.most_recent_school_year_tardies_count,
      school_name: student.try(:school).try(:name),
      school_type: student.try(:school).try(:school_type),
      homeroom_name: student.try(:homeroom).try(:name),
      discipline_incidents_count: student.most_recent_school_year_discipline_incidents_count,
      restricted_notes_count: student.event_notes.where(is_restricted: true).count,
    }).stringify_keys
  end

  def serialize_student_sections_for_profile(student)
    student.sections_with_grades.as_json({:include => { :educators => {:only => :full_name}}, :methods => :course_description})
  end

  def student_feed(student, restricted_notes: false)
    {
      event_notes: student.event_notes
        .map {|event_note| EventNoteSerializer.safe(event_note).serialize_event_note },
      transition_notes: student.transition_notes
        .select {|note| note.is_restricted == restricted_notes},
      services: {
        active: student.services.active.map {|service| ServiceSerializer.new(service).serialize_service },
        discontinued: student.services.discontinued.map {|service| ServiceSerializer.new(service).serialize_service }
      },
      deprecated: {
        interventions: student.interventions.map { |intervention| DeprecatedInterventionSerializer.new(intervention).serialize_intervention }
      }
    }
  end
end
