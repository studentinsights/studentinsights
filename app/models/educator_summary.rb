# typed: false
class EducatorSummary

  def initialize(options = {})

    if options[:school_scope].present?
      school = School.find_by_local_id!(options[:school_scope])
      @educators = school.educators
    else
      @educators = Educator
      report
    end

  end

  def report
    puts; puts "=== EDUCATOR REPORT ==="

    puts; puts "=== Admins:"
    puts @educators.where(admin: true).pluck(:full_name)

    puts; puts "=== Non-admins with school-wide access:"
    puts @educators.where(admin: false, schoolwide_access: true).pluck(:full_name)

    puts; puts "=== Staff members with grade level-based access:"
    @educators.where(admin: false)
            .where(schoolwide_access: false)
            .select { |e| e.homeroom.blank? }
            .select { |e| e.grade_level_access.size > 0 }
            .each do |educator|
      puts "#{educator.full_name} -- #{educator.grade_level_access}"
    end

    puts; puts "=== Staff members limited to student profiles of ELLs:"
    puts @educators.where(restricted_to_english_language_learners: true).pluck(:full_name)

    puts; puts "=== Staff members limited to student profiles of SPED students:"
    puts @educators.where(restricted_to_sped_students: true).pluck(:full_name)

    puts; puts "=== Homeroom teachers:"
    @educators.all.select { |e| e.homeroom.present? }
                .sort_by { |e| e.homeroom.grade }
                .each do |educator|
      puts "#{educator.full_name} -- #{educator.homeroom.name} -- Grade #{educator.homeroom.grade}"
    end

    puts; puts "=== Without any authorizations:"
    @educators.where(admin: false)
            .where(schoolwide_access: false)
            .select { |e| e.grade_level_access.empty? }
            .select { |e| e.homeroom.blank? }
            .each do |educator|
      puts educator.full_name
    end

    if @educators.where(local_id: nil).present?
      puts; puts "=== Without local IDs:"
      puts
      puts "    These are hand-rolled educator records."
      puts "    They are here because:"
      puts "      1. We couldn't get the data from X2."
      puts "      2. They were created in a lazy way by a certain unnamed developer."
      puts
      puts "    Give them a local ID when you have a moment!"
      puts "    Otherwise they have the potential to block X2 import down the line."
      puts @educators.where(local_id: nil).pluck(:email)
    end

    return
  end

end
