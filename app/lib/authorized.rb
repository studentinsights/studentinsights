# If you want student data, ask through this class.
# This class should be fully tested, and all changes should be reviewed.
# 
# Usage:
#   authorized = Authorized.new(current_educator)
#   authorized.students.find(student.id) # student profile page
#   authorized.students.where(section: section) # section page
#   authorized.students.where(homeroom: homeroom) # homeroom page
#   authorized.students.where(school: school) # overview page
#
# Instead of:
#   Homeroom.find(id).students # no authorization check
#   Section.find(id).students # no authorization check
#   current_educator.homeroom.students # doesn't consider other roles
#   current_educator.school.students # doesn't consider other roles
#
# Ideally this would be an ActiveRecord::Relation, but this doesn't
# work since we have to bounce back to Ruby in the current implementation.
# Using `where(foo: 'bar')` will return a Relation, but using the 
# block syntax will instead for eager evaluation (since it has to
# cross into Ruby).  This isn't great since using this wrapper would
# eagerly load all students always, but also not great since
# basic chaining like `authorized.students.size` wouldn't work.
#
# So, could we put this in sql?  Not sure how with districtwide admin,
# and certainly it's more complicated.
class Authorized
  def initialize(educator)
    @educator = educator
  end

  # This is the central place everything goes through
  def students(scope = Student.DANGEROUS.all)
    scope.select { |student| is_authorized_for_student?(student) }
  end

  def find_student(student_id)
    student = Student.DANGEROUS.find(student_id)
    if student.present? && is_authorized_for_student?(student)
      student
    else
      nil
    end
  end

  # This method is the source of truth for whether an educator is authorized to view information about a particular
  # student.
  def is_authorized_for_student?(student)
    return true if @educator.districtwide_access?

    return false if @educator.restricted_to_sped_students && !(student.program_assigned.in? ['Sp Ed', 'SEIP'])
    return false if @educator.restricted_to_english_language_learners && student.limited_english_proficiency == 'Fluent'
    return false if @educator.school_id.present? && student.school_id.present? && @educator.school_id != student.school_id

    return true if @educator.schoolwide_access? || @educator.admin? # Schoolwide admin
    return true if @educator.has_access_to_grade_levels? && student.grade.in?(@educator.grade_level_access) # Grade level access
    return true if student.in?(@educator.students.DANGEROUS) # Homeroom level access
    return true if student.in?(@educator.section_students.DANGEROUS) # Section level access
    false
  end
end