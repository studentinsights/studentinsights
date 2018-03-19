# This class is for expressing the different tiers
# of support that students should be receiving, to help
# educators catch and verify that students are getting
# the level of support and service they need.
class SomervilleHighTiersArray
  # FAILING_GRADE = 65

  # class Tier < Struct.new(:level, :reason, :data)
  # end

  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  def tiering(options = {})
    @time_now = options[:time_now] || Time.now
    @absence_time_interval = options[:absence_time_interval] || 45.days
    @discipline_time_interval = options[:discipline_time_interval] || 7.days

    school_ids = School.all.select(&:is_high_school?).map(&:id)
    @students = @authorizer.authorized do
      Student.all.where(school_id: school_ids)
    end

    @student_ids = @students.map(&:id)
    @absences = Absence.all
      .where(student_id: @student_ids)
      .where('occurred_at > ?', @time_now - @absence_time_interval)
      .to_a
    @discipline_incidents = DisciplineIncident.all
      .where(student_id: @student_ids)
      .where('occurred_at > ?', @time_now - @discipline_time_interval)
      .to_a
    @student_section_assignments = StudentSectionAssignment.all.
      where(student_id: @student_ids)
      .to_a

    students_count = @students.size
    @students.each_with_index.map do |student, index|
      percentage = (100.0 * index / students_count).round
      puts "   --- student #{student.id}, #{percentage}% ---"
      tier(student)
    end
  end

  private
  def tier(student)
    data = calculate_tiering_data(student)

    # Level 4: At least 4 F's
    #   OR less than 80% attendance over last 45 school days
    #   OR 7 or more discipline actions over the last 45 school days
    return Tier.new(4, :academic, data) if data[:course_failures] >= 4
    return Tier.new(4, :absence, data) if data[:recent_absence_rate] < 0.80
    return Tier.new(4, :discipline, data) if data[:recent_discipline_actions] >= 7

    # Level 3: 3 F's
    #   OR less than 85% attendance over last 45
    #   OR 5-6 discipline actions over the last 45 school days
    return Tier.new(3, :academic, data) if data[:course_failures] >= 3
    return Tier.new(3, :absence, data) if data[:recent_absence_rate] < 0.85
    return Tier.new(3, :discipline, data) if data[:recent_discipline_actions] >= 5

    # Level 2: 2 F's
    #  OR less than 90% attendance over last 45
    #  (no discipline involved in calculation)
    return Tier.new(2, :academic, data) if data[:course_failures] >= 2
    return Tier.new(2, :absence, data) if data[:recent_absence_rate] < 0.90

    # Level 1: 1 F and 2 Ds
    #   OR less than 95% attendance over last 45 days
    #   (no discipline involved)
    return Tier.new(1, :academic, data) if data[:course_failures] == 1 and data[:course_ds] >= 2
    return Tier.new(1, :absence, data) if data[:recent_absence_rate] < 0.95

    # Level 0: Not any of the other levels
    return Tier.new(0, :none, data)
  end

  def course_failures(student)
    @student_section_assignments.select do |assignment|
      if assignment.student_id != student.id
        false
      elsif assignment.grade_numeric.nil?
        false
      elsif assignment.grade_numeric > FAILING_GRADE
        false
      else
        true
      end
    end.size
  end

  def course_ds(student)
    @student_section_assignments.select do |assignment|
      if assignment.student_id != student.id
        false
      elsif assignment.grade_numeric.nil?
        false
      elsif assignment.grade_numeric < FAILING_GRADE
        false
      elsif assignment.grade_numeric > 69
        false
      else
        true
      end
    end.size
  end

  # This uses a super rough heuristic for school days.
  def recent_absence_rate(student)
    absences_count = @absences.select do |absence|
      if absence.student_id != student.id
        false
      elsif absence.occurred_at < @time_now - @absence_time_interval
        false
      else
        true
      end
    end.size
    total_days = @absence_time_interval / 1.day
    school_days = (total_days * 5/7).round
    (school_days - absences_count) / school_days.to_f
  end

  # This doesn't actually check actions; it only looks at
  # events since we don't have actions from Aspen yet.
  def recent_discipline_actions(student)
    @discipline_incidents.select do |discipline_incident|
      if discipline_incident.student_id != student.id
        false
      elsif discipline_incident.occurred_at < @time_now - @discipline_time_interval
        false
      else
        true
      end
    end.size
  end

  def calculate_tiering_data(student)
    {
      course_failures: course_failures(student),
      course_ds: course_ds(student),
      recent_absence_rate: recent_absence_rate(student),
      recent_discipline_actions: recent_discipline_actions(student)
    }
  end
end
