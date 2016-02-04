class EducatorSummary

  def report
    puts; puts "=== EDUCATOR REPORT ==="

    puts; puts "=== Admins:"
    puts Educator.where(admin: true).pluck(:full_name)

    puts; puts "=== Non-admins with school-wide access:"
    puts Educator.where(admin: false, schoolwide_access: true).pluck(:full_name)

    puts; puts "=== Staff members with grade level-based access:"
    Educator.where(admin: false)
            .where(schoolwide_access: false)
            .select { |e| e.homeroom.blank? }
            .select { |e| e.grade_level_access.size > 0 }
            .each do |educator|
      puts "#{educator.full_name} -- #{educator.grade_level_access}"
    end

    puts; puts "=== Staff members limited to student profiles of ELLs:"
    puts Educator.where(restricted_to_english_language_learners: true).pluck(:full_name)

    puts; puts "=== Staff members limited to student profiles of SPED students:"
    puts Educator.where(restricted_to_sped_students: true).pluck(:full_name)

    puts; puts "=== Homeroom teachers:"
    Educator.all.select { |e| e.homeroom.present? }.each do |educator|
      puts "#{educator.full_name} -- #{educator.homeroom.name} -- Grade #{educator.homeroom.grade}"
    end

    puts; puts "=== Without any authorizations:"
    Educator.where(admin: false)
            .where(schoolwide_access: false)
            .select { |e| e.grade_level_access.empty? }
            .select { |e| e.homeroom.blank? }
            .each do |educator|
      puts educator.full_name
    end

    return
  end

end
