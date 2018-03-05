class HomeController < ApplicationController
  def home
    @serialized_data = {
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  def assignments_json
    students = authorized { Student.all }
    failing_assignments = StudentSectionAssignment
      .where('grade_numeric < ?', 65)
      .where(student_id: students.map(&:id))

    assignments_json = failing_assignments.map do |assignment|
      assignment.as_json({
        :only => [:id, :grade_letter, :grade_numeric],
        :include => {
          :student => {
            :only => [:id, :email, :first_name, :last_name, :grade, :house]
          },
          :section => {
            :only => [:section_number, :schedule, :room_number],
            :include => {
              :educators => {:only => [:id, :full_name, :email]}
            }
          }
        }
      })
    end

    render json: {
      assignments: assignments_json
    }
  end

  def notes_json
    limit = 20
    event_notes = authorized { EventNote.all.order(updated_at: :desc) }
    recent_event_notes = event_notes.first(limit)
    event_notes_json = recent_event_notes.map do |event_note|
      event_note.as_json({
        :only => [:id, :updated_at, :event_note_type_id, :text],
        :include => {
          :educator => {:only => [:id, :full_name, :email]},
          :student => {
            :only => [:id, :email, :first_name, :last_name, :grade, :house],
            :include => {
              :homeroom => {
                :only => [:id, :name],
                :include => {
                  :educator => {:only => [:id, :full_name, :email]}
                }
              }
            }
          }
        }
      })
    end
    render json: {
      event_notes: event_notes_json
    }
  end
end
