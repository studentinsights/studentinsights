class InsightStudentsWithLowGrades
  EXPERIENCE_TEAM_GRADES = ['9', '10']

  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  # High-school only.  Returns a list of students in the educator's
  # sections that have low grades, but haven't been commented on in
  # NGE or 10GE yet.  The intention is that this information is immediately
  # actionable for high school teachers.
  #
  # This method returns hashes that are the shape of what is needed
  # in the product.
  def students_with_low_grades_json(time_now, time_threshold, grade_threshold)
    all_assignments = assignments(time_now, time_threshold, grade_threshold)
    by_student = all_assignments.group_by(&:student)
    json = by_student.map do |student, assignments|
      {
        student: student.as_json(:only => [:id, :email, :first_name, :last_name, :grade, :house]),
        assignments: assignments.map {|assignment| serialize_assignment(assignment) }
      }
    end
    json.as_json
  end

  private
  def assignments(time_now, time_threshold, grade_threshold)
    # This is high-school only, only look at students the educator
    # has in their own sections.  And only look at students in the
    # experience team program.
    students = @authorizer.authorized { @educator.section_students }
    nge_or_10ge_students = students.select do |student|
      included_in_experience_team?(student)
    end
    student_ids = nge_or_10ge_students.map(&:id)

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

  # Section assignments where a student is struggling.
  # Does not respect authorization.
  def assignments_below_threshold(student_ids, grade_threshold)
    educator_section_ids = @educator.sections.map(&:id)
    StudentSectionAssignment
      .includes(:student)
      .where(section: educator_section_ids)
      .where(student_id: student_ids)
      .where('grade_numeric < ?', grade_threshold)
      .order(grade_numeric: :desc)
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
        :section => {
          :only => [:id, :section_number],
          :methods => [:course_description],
          :include => {
            :educators => {:only => [:id, :full_name, :email]}
          }
        }
      }
    })
  end

  # This is an imprecise heuristic in general but works here.
  # In reality, it's more nuanced than this in reality; the NGE and
  # 10GE teams are defined by the teachers who are in it, not the
  # students.  The more precise way to answer this is to look at that
  # list of teachers, and then the list of students who are in their
  # sections and also in NGE and 10GE.
  def included_in_experience_team?(student)
    EXPERIENCE_TEAM_GRADES.include?(student.grade)
  end
end
