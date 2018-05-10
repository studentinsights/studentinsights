# This class is authorization-aware, and checks authorization for the grade level
# in a different, more permissive way than normal.  This lets a classroom teacher
# at a particular grade access all students in their school at that same grade level.
#
# And it lets districtwide and schoolwide users work as expected, with no additional
# cases for grade-level access, sped or ELL levels of access.
class ClassListQueries
  def initialize(educator)
    @educator = educator
  end

  # What grade levels do we want to support creating class lists for?
  def supported_grade_levels_next_year
    ['1','2','3','4','5','6']
  end

  # What schools are supported?
  def supported_schools
    School.where(school_type: ['ESMS', 'ES', 'MS'])
  end

  # This is authorization-aware, and checks authorization for the grade level
  # in a different, more permissive way than normal.
  def authorized_students_for_next_year(school_id, grade_level_next_year)
    grade_level_now = GradeLevels.new.previous(grade_level_next_year)
    return [] unless is_authorized_for_grade_level_now?(school_id, grade_level_now)

    # Query for those students (outside normal authorization rules)
    Student.active.where({
      school_id: school_id,
      grade: grade_level_now
    })
  end

  # This is authorization-aware and lets educators read writes for workspace where they
  # have access to create their own list in that same grade level and school.
  def read_authorized_class_list(workspace_id)
    authorized_class_list(workspace_id).tap do |class_list|
      class_list.readonly! unless class_list.nil?
    end
  end

  def all_authorized_workspaces
    # Get latest by workspace_id
    all_class_lists = ClassList.order(created_at: :desc)
    workspaces = all_class_lists.group_by(&:workspace_id).map do |workspace_id, class_lists|
      class_list = class_lists.sort_by {|class_list| -1 * class_list.created_at.to_i }.first
      ClassListWorkspace.new(workspace_id, class_list, class_lists.size)
    end

    # Authorization check
    workspaces.select do |workspace|
      class_list = workspace.class_list
      grade_level_now = GradeLevels.new.previous(class_list.grade_level_next_year)
      is_authorized_for_grade_level_now?(class_list.school_id, grade_level_now)
    end
  end

  # Educators can only write to workspaces they created, or to unowned workspaces.
  def is_authorized_for_writes?(workspace_id)
    owner = ClassList.workspace_owner(workspace_id)
    return true if owner.nil?
    return true if owner.id == @educator.id
    false
  end

  # This is intended only for use in this controller, and allows more people
  # "grade level access" than the standard authorization rules.  It's based off
  # code in `authorizer#is_authorized_for_student?` but is different and more permissive.
  def is_authorized_for_grade_level_now?(school_id, grade_level_now)
    return false unless GradeLevels.new.next(grade_level_now).in?(supported_grade_levels_next_year)
    return false unless school_id.in?(supported_schools.map(&:id))
    return false unless is_authorized_for_school_id?(school_id)

    return true if @educator.districtwide_access?
    return true if @educator.admin?
    return true if @educator.schoolwide_access?
    return true if grade_level_now == @educator.homeroom.try(:grade)

    false
  end

  # Is the user assigned to that school? (ie, this isn't the same as "do they
  # have access to everything in that school, it's more permissive).
  def is_authorized_for_school_id?(school_id)
    return true if @educator.districtwide_access?
    return true if @educator.school_id == school_id
    false
  end

  private
  def authorized_class_list(workspace_id, options = {})
    class_lists = ClassList
      .order(created_at: :desc)
      .limit(1)
      .where((options[:where] || {}).merge({
        workspace_id: workspace_id
      }))
    return nil unless class_lists.size == 1

    # Check that educator is authorized for that grade level and school
    class_list = class_lists.first
    grade_level_now = GradeLevels.new.previous(class_list.grade_level_next_year)
    return nil unless is_authorized_for_grade_level_now?(class_list.school_id, grade_level_now)

    class_list
  end
end
