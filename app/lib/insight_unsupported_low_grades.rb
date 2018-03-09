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
    student_ids = students.map(&:id)

    # Query for low grades and uncommented students, then join both
    # This query structure came to be after some optimizations to reduce
    # latency for HS dept. heads who have access to many students.
    low_assignments = assignments_below_threshold(student_ids, grade_threshold)
    commented_student_ids = recently_commented_student_ids(student_ids, time_threshold)
    low_assignments.select do |assignment|
      !commented_student_ids.include?(assignment.student_id)
    end
  end

  # Send down all field for UI
  def as_json(assignments)
    assignments.map {|assignment| serialize_assignment(assignment) }
  end

  private
  # Section assignments where a student is struggling.
  # Does not respect authorization.
  def assignments_below_threshold(student_ids, grade_threshold)
    StudentSectionAssignment
      .includes(:student)
      .where(student: student_ids)
      .where('grade_numeric < ?', grade_threshold)
      .order(grade_numeric: :asc)
  end

  # Students who've commented recently
  def recently_commented_student_ids(student_ids, time_threshold)
    recent_notes = EventNote
      .where(is_restricted: false)
      .where(student_id: student_ids)
      .where('recorded_at > ?', time_threshold)
      .where(event_note_type_id: [305, 306])
    recent_notes.map(&:student_id).uniq
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
