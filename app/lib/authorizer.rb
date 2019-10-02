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

  # Double authorization layer for doppleganging features, where the current
  # user has elevated permissions and wants to view something as if they were
  # another user.
  # Runs the authorization layer first for the educator we're viewing as,
  # but after that runs it again to ensure the current elevated permission user
  # actually has access to those students too.  This second layer only slows down
  # dopplegangers, and adds another layer of protection to ensure that we only ever
  # show dopplegangers the intersection of who `view_as_educator` would see and
  # who they are authorized to see themselves.
  #
  # Usage:
  #  authorized_students = authorized_when_viewing_as(other_educator) { Student.active }
  def authorized_when_viewing_as(view_as_educator, &block)
    authorized do
      if @educator.can_set_districtwide_access? && view_as_educator.id != @educator.id
        Authorizer.new(view_as_educator).authorized(&block)
      else
        block.call
      end
    end
  end

  # This is the main authorization method.
  def is_authorized_for_student?(student, options = {})
    why_authorized_for_student?(student, options).present?
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
  def why_authorized_for_student?(student, options = {})
    begin
      should_consider_sections = options.fetch(:should_consider_sections, PerDistrict.new.enabled_sections?)
      return :districtwide if @educator.districtwide_access?
      # As a performance optimization, this check excludes `dynamic_labels`, since they're a bit more
      # expensive to compute, and here we only need to check one specific label that we know
      # is static.  Also, PerfTest shows that although it might seem like moving the env check first would
      # speed this up by avoiding the labels query, this order is consistently faster when the ENV value
      # is not set.
      return :housemaster if @educator.labels(exclude_dynamic_labels: true).include?('high_school_house_master') && student.grade == '8' && EnvironmentVariable.is_true('HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8')

      return nil if @educator.restricted_to_sped_students && !(student.program_assigned.in? ['Sp Ed', 'SEIP'])
      return nil if @educator.restricted_to_english_language_learners && student.limited_english_proficiency == 'Fluent'
      return nil if @educator.school_id.present? && student.school_id.present? && @educator.school_id != student.school_id

      return :schoolwide if @educator.schoolwide_access? || @educator.admin? # Schoolwide admin
      return :grade_level if @educator.has_access_to_grade_levels? && student.grade.in?(@educator.grade_level_access) # Grade level access

      # The next two checks call `#to_a` as a performance optimization.
      # In loops with `authorized { Student.active }`, without forcing this
      # to an eagerly evaluated array, repeated calls will keep making the
      # same queries.  This seems unexpected to me, but adding `to_a` at
      # the end results in Rails caching these queries across the repeated
      # calls in the loop.  So we can do that here, and let callers who
      # are calling this in a loop get the optimization without having to
      # optimize themselves.
      return :homeroom if student.in?(@educator.students.to_a) # Homeroom level access

      return :section if should_consider_sections && student.in?(@educator.section_students.to_a) # Section level access
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
    nil
  end

  def is_authorized_for_school?(school)
    return true if @educator.districtwide_access?
    return true if @educator.schoolwide_access? && @educator.school == school
    return true if @educator.has_access_to_grade_levels? && @educator.school == school
    false
  end

  def is_authorized_for_section?(section)
    return false unless PerDistrict.new.enabled_sections?
    return true if @educator.districtwide_access?

    return false if @educator.school.present? && @educator.school != section.course.school

    return true if @educator.schoolwide_access? || @educator.admin?
    return true if section.in?(@educator.sections)
    false
  end

  # Works for EventNote or TransitionNote
  def is_authorized_for_note?(event_note)
    return false unless is_authorized_for_student?(event_note.student)
    return false if event_note.is_restricted && !@educator.can_view_restricted_notes
    true
  end

  def is_authorized_to_write_transition_notes?
    return false unless @educator.can_view_restricted_notes
    return false unless @educator.labels.include?('k8_counselor')
    true
  end

  # Determine access to homerooms through authorization rules for students.
  # Only allow access to homeroom if the educator is assigned to the homeroom
  # explicitly or if they have access to all students in the homeroom.
  # The intention is to centralize authorization rules into student methods
  # (ie, `why_authorized_for_student?`).
  #
  # This is optimized to run over many educators, verify the impact on
  # `PerfTest.homerooms` before making changes.
  def homerooms(options = {})
    # Query for all students up front, then pass through authorizer.
    unsafe_all_students = Student.active.includes(:homeroom).to_a
    students = authorized { unsafe_all_students }

    # In memory, group each list by homeroom.
    unsafe_students_by_homeroom = unsafe_all_students.group_by(&:homeroom)
    authorized_students_by_homeroom = students.group_by(&:homeroom)

    # In the deprecated method, it would include access to Homerooms that
    # had no students.  In the new method, this doesn't make sense (and there's
    # no real point).  But this allows an option to force using the older method
    # within tests, which will over-include homerooms with zero students.
    potential_homerooms = if options.fetch(:force_search_all_homerooms, false)
      Homeroom.all.includes(:students)
    else
      authorized_students_by_homeroom.keys.compact
    end

    # Iterate in memory, and find only homerooms where educator
    # can access all students.
    homerooms = []
    potential_homerooms.each do |homeroom|
      authorized_students_in_homeroom = authorized_students_by_homeroom[homeroom]
      unsafe_students_in_homeroom = unsafe_students_by_homeroom[homeroom]
      next if Set.new(unsafe_students_in_homeroom) != Set.new(authorized_students_in_homeroom)
      homerooms << homeroom
    end
    homerooms
  end

  # deprecated, use `#homerooms` instead
  def allowed_homerooms_DEPRECATED(options = {})
    raise Exceptions::DeprecatedFeatureError unless options.fetch(:acknowledge_deprecation, false)

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
end
