class HomeController < ApplicationController
  def home
    @serialized_data = {
      current_educator: current_educator
    }
    render 'shared/serialized_data'
  end

  def unsupported_low_grades_json
    time_now = Time.now

    # Section assignments where a student is struggling.
    # This is high-school only, so don't look at other students even if authorized.
    students = authorized { School.select(&:is_high_school?).flat_map(&:students) }
    low_assignments = assignments_below_threshold(students.map(&:id), grade_threshold: 69)

    # Remove assignments if NGE or 10GE team has commented on 
    # that student recently.
    time_threshold = time_now - 30.days
    unsupported_low_assignments = low_assignments.select do |assignment|
      !has_experience_team_commented?(assignment, time_threshold: time_threshold)
    end

    # Send down all data for UI
    assignments_json = unsupported_low_assignments.map do |assignment|
      serialize_assignment(assignment)
    end

    render json: {
      assignments: assignments_json
    }
  end
  
  # TODO(kr) Authorized behaves in unexpected ways here with `select`
  def birthdays_json
    time_now = Time.now
    students = authorized do
      Student.select(:id, :primary_email, :first_name, :last_name, :date_of_birth).all
        .where('extract(doy from date_of_birth) > ?', time_now.yday - 7)
        .where('extract(doy from date_of_birth) < ?', time_now.yday + 7)
    end
    students_json = students.map do |student|
      student.as_json({
        :only => [:id, :email, :first_name, :last_name, :date_of_birth]
      })
    end
    render json: {
      students: students_json
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

  private
  def assignments_below_threshold(student_ids, options = {})
    grade_threshold = options[:grade_threshold] || 69
    StudentSectionAssignment
      .includes(:student)
      .where('grade_numeric < ?', grade_threshold)
      .where(student_id: student_ids)
      .order(grade_numeric: :asc)
  end

  def serialize_assignment(assignment)
    assignment.as_json({
      :only => [:id, :grade_letter, :grade_numeric],
      :include => {
        :student => {
          :only => [:id, :email, :first_name, :last_name, :grade, :house]
        },
        :section => {
          :only => [:id, :section_number, :schedule, :room_number],
          :include => {
            :educators => {:only => [:id, :full_name, :email]}
          }
        }
      }
    })
  end

  def has_experience_team_commented?(assignment, options = {})
    raise 'missing param' unless options[:time_threshold]
    assignment.student.event_notes
      .where(is_restricted: false)
      .where('recorded_at > ?', options[:time_threshold])
      .where(event_note_type_id: [305, 306])
      .count > 0
  end
end
