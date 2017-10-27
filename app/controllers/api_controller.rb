class ApiController < ApplicationController
    
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger

  skip_before_action :authenticate_educator!  # Devise method, applies to all controllers.
                                           # In this app 'users' are 'educators'.

# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger# danger# danger# danger# danger# danger# danger# danger# danger
# danger

  def me
    current_educator = Educator.first
    render json: current_educator
  end

  def educator
    educator = Educator.find(params[:id])
    render json: educator
  end

  def school
    school = School.find(params[:id])
    render json: school.as_json.merge({
      student_ids: school.students.map(&:id).first(3)
    })
  end

  def student
    student = Student.find(params[:id])
    render json: student.as_json.merge({
      absences_count: student.absences.size,
      discipline_incidents_count: student.discipline_incidents.size,
      tardies_count: student.tardies.size,
      event_notes_count: student.event_notes.size,
      event_note_ids: student.event_notes.map(&:id),
      services_count: student.services.size,
      service_ids: student.services.map(&:id)
    })
  end

  def service
    service = Service.find(params[:id])
    render json: service
  end

  def event_note
    event_note = EventNote.find(params[:id])
    render json: event_note
  end

  def service_types
    render json: ServiceType.all
  end

  def event_note_types
    render json: EventNoteType.all
  end
end
