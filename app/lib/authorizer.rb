# This class defines authorization rules.
# If you want student data, ask through this class.
# Ideally, start with using `authorized`.
# Drop down to calling individual methods if you need to.
#
# This class should be fully tested, and all changes should be reviewed.
#
# Controller usage:
#   student = authorized { Student.find(params[:id]) }
#   homeroom = authorized { Homeroom.(params[:id]) }
#   students = authorized { homeroom.students }
#
# Standalone usage:
#   authorizer = Authorizer.new(educator)
#   student = authorizer.authorized { Student.find(params[:id]) }
#   homeroom = authorizer.authorized { Homeroom.(params[:id]) }
#   students = authorizer.authorized { homeroom.students }
#
# Instead of:
#   Homeroom.find(id).students # no authorization check
#   Section.find(id).students # no authorization check
#   current_educator.homeroom.students # doesn't work for all roles
#   current_educator.school.students # doesn't work for all roles
#
class Authorizer
  # These fields are required on the `Student` model for
  # authorization checks
  def self.student_fields_for_authorization
    [
      :id,
      :program_assigned,
      :limited_english_proficiency,
      :school_id,
      :grade
    ]
  end

  def initialize(educator)
    @educator = educator
    @authorized_dispatcher = AuthorizedDispatcher.new(self)
  end

  # Usage:
  #  student = authorized { Student.find(params[:id]) }
  def authorized(&block)
    @authorized_dispatcher.dispatch(&block)
  end

  # This method is the source of truth for whether an educator is authorized to view information about a particular
  # student.
  def is_authorized_for_student?(student)
    begin
      return true if @educator.districtwide_access?

      return false if @educator.restricted_to_sped_students && !(student.program_assigned.in? ['Sp Ed', 'SEIP'])
      return false if @educator.restricted_to_english_language_learners && student.limited_english_proficiency == 'Fluent'
      return false if @educator.school_id.present? && student.school_id.present? && @educator.school_id != student.school_id

      return true if @educator.schoolwide_access? || @educator.admin? # Schoolwide admin
      return true if @educator.has_access_to_grade_levels? && student.grade.in?(@educator.grade_level_access) # Grade level access
      return true if student.in?(@educator.students) # Homeroom level access
      return true if student.in?(@educator.section_students) # Section level access
    rescue ActiveModel::MissingAttributeError => err
      # We can't do authorization checks on models with `#select` that are missing
      # fields.  If this happens, it's probably because the developer is trying to
      # to optimize a query.  The authorization layer could only recover by making more
      # queries, so instead we raise and force the developer to figure out how to resolve.
      #
      # See `Authorizer.student_fields_for_authorization`
      raise err
    end
    false
  end

  def is_authorized_for_school?(school)
    return true if @educator.districtwide_access?
    return true if @educator.schoolwide_access? && @educator.school == school
    return true if @educator.has_access_to_grade_levels? && @educator.school == school
    false
  end

  def is_authorized_for_section?(section)
    return true if @educator.districtwide_access?

    return false if @educator.school.present? && @educator.school != section.course.school

    return true if @educator.schoolwide_access? || @educator.admin?
    return true if section.in?(@educator.sections)
    false
  end

  def is_authorized_for_note?(event_note)
    return false unless is_authorized_for_student?(event_note.student)
    return false if event_note.is_restricted && !@educator.can_view_restricted_notes
    true
  end

  # TODO(kr) remove implementation
  def students_for_school_overview
    return [] unless @educator.school.present?

    if @educator.schoolwide_access?
      @educator.school.students.active
    elsif @educator.has_access_to_grade_levels?
      @educator.school.students
        .active
        .where(grade: @educator.grade_level_access)
    else
      []
    end
  end

  # TODO(kr) remove implementation
  def homerooms
    # Educator can visit roster view for these homerooms
    return [] if @educator.school.nil?

    if @educator.districtwide_access?
      Homeroom.all
    elsif @educator.schoolwide_access?
      @educator.school.homerooms.all
    elsif @educator.homeroom
      @educator.school.homerooms.where(grade: @educator.homeroom.grade)
    elsif @educator.grade_level_access.present?
      @educator.school.homerooms.where(grade: @educator.grade_level_access)
    else
      []
    end
  end

  # TODO(kr) remove implementation
  def sections
    if @educator.districtwide_access?
      Section.all
    elsif @educator.schoolwide_access?
      Section.joins(:course).where('courses.school_id = ?', @educator.school.id)
    else
      @educator.sections
    end
  end
end
