class InsightUnsupportedLowGrades
  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  # High-school only.  Returns assignments with low grades where
  # the student hasn't been commented on in NGE or 10GE yet. 
  def assignments(time_now, time_threshold, grade_threshold)
    # This is high-school only, so don't look at other students even if authorized.
    students = @authorizer.authorized do
      School.select(&:is_high_school?).flat_map(&:students)
    end
    low_assignments = assignments_below_threshold(students.map(&:id), grade_threshold)

    # Remove assignments if NGE or 10GE team has commented on 
    # that student recently.
    low_assignments.select do |assignment|
      !has_experience_team_commented?(assignment, time_threshold)
    end
  end

  # Send down all field for UI
  def as_json(assignments)
    assignments.map {|assignment| serialize_assignment(assignment) }
  end

  private
  # Section assignments where a student is struggling.
  def assignments_below_threshold(student_ids, grade_threshold)
    StudentSectionAssignment
      .includes(:student)
      .where('grade_numeric < ?', grade_threshold)
      .where(student_id: student_ids)
      .order(grade_numeric: :asc)
  end

  def has_experience_team_commented?(assignment, time_threshold)
    assignment.student.event_notes
      .where(is_restricted: false)
      .where('recorded_at > ?', time_threshold)
      .where(event_note_type_id: [305, 306])
      .count > 0
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
end