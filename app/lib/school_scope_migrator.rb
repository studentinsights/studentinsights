# For manual or semi-automated migrations related to changing school scope 
# in definition files or in import jobs.
# 
# For example, if removing a school, you might update the definition file,
# then use this class to run a migration that marks all Student and Educator
# records that used to be in scope as inactive.
#
# While school scope in the importers allow them to do "partial imports" for
# migrations, incremental deploys, or debugging, this class allows us to
# ask questions and migrate data that is outside that scope when the scope
# changes.
class SchoolScopeMigrator
  def initialize(options = {})
    @explicit_school_scope = options.fetch(:schools, nil)
  end

  # As defined in definition file, or passed explicitly.
  def schools_within_scope
    return @explicit_school_scope if @explicit_school_scope.present?
    school_local_ids = PerDistrict.new.school_definitions_for_import.map {|j| j['local_id'] }
    School.where(local_id: school_local_ids)
  end

  def migrate_all!
    puts "Finding schools..."
    schools = self.schools_within_scope()
    puts "There are #{schools.size} School records within scope."
    puts
    puts
    migrate_educators!
    puts
    puts
    migrate_students!
    puts
    puts
    puts "All done."
  end

  def migrate_educators!
    puts "Starting Educators..."
    Educator.transaction do
      puts "  Found #{Educator.active.size} active and #{Educator.all.size} total Educator records."
      educator_ids_within_scope = self.educators_within_scope().map(&:id)
      puts "  Found #{educator_ids_within_scope.size} Educator records within scope..."
      stale_educators = self.stale_educators()
      puts "  Ensuring missing_from_last_export:true for #{stale_educators.size} stale Educator records..."
      puts "  Actually setting missing_from_last_export:true for #{stale_educators.active.size} currently active stale Educator records..."
      stale_educators.active.each do |educator|
        educator.update!(missing_from_last_export: true)
      end
      puts "  Done updating Educators."
    end
  end

  def migrate_students!
    puts "Starting Students..."
    Student.transaction do
      puts "  Found #{Student.active.size} active and #{Student.all.size} total Student records."
      student_ids_within_scope = self.students_within_scope().map(&:id)
      puts "  Found #{student_ids_within_scope.size} Student records within scope..."
      stale_students = self.stale_students()
      puts "  Ensuring missing_from_last_export:true for #{stale_students.size} stale Student records..."
      puts "  Actually setting missing_from_last_export:true for #{stale_students.active.size} currently active stale Student records..."
      stale_students.active.each do |student|
        student.update!(missing_from_last_export: true)
      end
      puts "  Done updating Students."
    end
  end

  def educators_within_scope
    schools = schools_within_scope()
    active_educators = Educator.active

    (
      active_educators.where(school_id: nil) +
      active_educators.where(school_id: schools.map(&:id)) +
      active_educators.where(login_name: PerDistrict.new.educator_login_names_whitelisted_as_active())
    ).uniq
  end

  def stale_educators
    Educator.all.where.not(id: educators_within_scope().map(&:id))
  end

  def students_within_scope
    schools = schools_within_scope()
    active_students = Student.active
    (
      active_students.where(school_id: nil) +
      active_students.where(school_id: schools.map(&:id))
    ).uniq
  end

  def stale_students
    Student.all.where.not(id: students_within_scope().map(&:id))
  end
end