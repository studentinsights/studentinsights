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
#   current_educator.homeroom.students # doesn't work for all roles because
#     some roles don't have homeroom associations (e.g. if they're school-wide)
#   current_educator.school.students # doesn't work for all roles because
#     some roles don't have school associations (e.g. if they're district-wide)

#
class Authorizer
  # These fields are required on the `Student` model for
  # authorization checks.
  def self.student_fields_for_authorization
    [
      :id,
      :program_assigned,
      :limited_english_proficiency,
      :school_id,
      :grade
    ]
  end

  # These fields are required on the `Educator` model for
  # authorization checks.
  def self.educator_fields_for_authorization
    [
      :schoolwide_access,
      :grade_level_access,
      :restricted_to_sped_students,
      :restricted_to_english_language_learners,
      :districtwide_access,
      :school_id,
      :admin
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
  #
  # There are several performance optimizations applied here (see git history
  # for more), since this method is heavily used and latency regressions impact
  # almost every page.  The latency of this method is also quite different for
  # different users, because of the different layers of checks.  Users with
  # districtwide or schoolwide access may have lower latency (and are therefore bad
  # test cases) since we don't need to care about the details when checking their
  # access.
  def is_authorized_for_student?(student, options = {})
    begin
      return true if @educator.districtwide_access?

      return false if @educator.restricted_to_sped_students && !(student.program_assigned.in? ['Sp Ed', 'SEIP'])
      return false if @educator.restricted_to_english_language_learners && student.limited_english_proficiency == 'Fluent'
      return false if @educator.school_id.present? && student.school_id.present? && @educator.school_id != student.school_id

      return true if @educator.schoolwide_access? || @educator.admin? # Schoolwide admin
      return true if @educator.has_access_to_grade_levels? && student.grade.in?(@educator.grade_level_access) # Grade level access

      # The next two checks call `#to_a` as a performance optimization.
      # In loops with `authorized { Student.all }`, without forcing this
      # to an eagerly evaluated array, repeated calls will keep making the
      # same queries.  This seems unexpected to me, but adding `to_a` at
      # the end results in Rails caching these queries across the repeated
      # calls in the loop.  So we can do that here, and let callers who
      # are calling this in a loop get the optimization without having to
      # optimize themselves.
      return true if student.in?(@educator.students.to_a) # Homeroom level access
      return true if student.in?(@educator.section_students.to_a) # Section level access
    rescue ActiveModel::MissingAttributeError => err
      # We can't do authorization checks on models with `#select` that are missing
      # fields.  If this happens, it's probably because the developer is trying to
      # to optimize a query.  The authorization layer could only recover by making more
      # queries, so instead we raise and force the developer to figure out how to resolve.
      #
      # See `Authorizer.student_fields_for_authorization` and `Authorizer.educator_field_for_authorization`
      # to see what fields are required on each model.
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

  # There are five types of entry experiences, depending on levels
  # of access.
  def homepage_type
    begin
      return :districtwide if @educator.districtwide_access?
      return :school if @educator.schoolwide_access? || @educator.has_access_to_grade_levels?
      return :section if @educator.school.school_type == 'HS' && @educator.default_section
      return :homeroom if @educator.school.school_type != 'HS' && @educator.default_homeroom
      return :nothing
    rescue Exceptions::NoAssignedHomeroom, Exceptions::NoAssignedSections => _
      :nothing
    end
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
