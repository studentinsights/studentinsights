class ReflectionController < ApplicationController
  before_action :ensure_authorized!

  def notes_patterns_json
    # notes for this school year, for students they work with
    time_now = Time.now
    school_year = SchoolYear.to_school_year(time_now)
    start_of_school_year = SchoolYear.first_day_of_school_for_year(school_year)
    puts 'time_now:'
    puts time_now
    puts 'start_of_school_year:'
    puts start_of_school_year

    students = authorizer.authorized { Student.active.to_a }
    event_notes = authorizer.authorized do
      EventNote
        .where(student: students.map(&:id))
        .where(is_restricted: false)
        .where('recorded_at >= ?', start_of_school_year)
    end

    # by student, flatten out and segment text
    notes_by_student_id = event_notes.group_by(&:student_id)
    segments_by_student_id = {}
    notes_by_student_id.each do |student_id, event_notes|
      note_texts = event_notes.map(&:text)
      segments = note_texts.flat_map do |text|
        PragmaticSegmenter::Segmenter.new(text: text, language: 'en').segment
      end
      segments_by_student_id[student_id] = segments
    end

    render json: {
      students: students.as_json(only: [:id, :first_name, :last_name, :grade, :house]),
      segments_by_student_id: segments_by_student_id
    }
  end

  private
  def ensure_authorized!
    is_authorized = current_educator.labels.include?('enable_reflection_on_notes_patterns') || EnvironmentVariable.is_true('ENABLE_REFLECTION_ON_NOTES_FOR_ALL')
    raise Exceptions::EducatorNotAuthorized unless is_authorized
  end
end
