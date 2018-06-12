# This class is for expressing the different tiers
# of support that students should be receiving, to help
# educators catch and verify that students are getting
# the level of support and service they need.
class SomervilleHighTiers
  FAILING_GRADE = 65

  class Tier < Struct.new(:level, :triggers, :data)
  end

  def initialize(educator)
    @educator = educator
    @authorizer = Authorizer.new(@educator)
  end

  def students_with_tiering_json(school_ids, time_now)
    students = @authorizer.authorized do
      Student.active
        .where(school_id: school_ids)
        .includes(student_section_assignments: [section: :course])
        .includes(:event_notes)
        .to_a # TODO(kr) authorizer select behavior is unexpected here, and silently leads to no first_name, last_name, etc.
    end

    students.map do |student|
      tier_json = tier(student, time_now: time_now).as_json
      notes_json = last_notes_json(student)
      student_json = student.as_json({
        only: [:id, :first_name, :last_name, :grade, :house, :sped_placement, :program_assigned],
        include: {
          student_section_assignments: {
            :only => [:id, :grade_letter, :grade_numeric],
            :include => {
              :section => {
                :only => [:id, :section_number],
                :methods => [:course_description]
              }
            }
          }
        }
      })
      student_json.merge(tier: tier_json).merge(notes: notes_json)
    end
  end

  def tier(student, options = {})
    time_now = options[:time_now] || Time.now
    data = calculate_tiering_data(student, time_now)

    # Level 4: At least 4 F's
    #   OR less than 80% attendance over last 45 school days
    #   OR 7 or more discipline actions over the last 45 school days
    tier_four_triggers = [
      (:academic if data[:course_failures] >= 4),
      (:absence if data[:recent_absence_rate] < 0.80),
      (:discipline if data[:recent_discipline_actions] >= 7)
    ].compact
    return Tier.new(4, tier_four_triggers, data) if tier_four_triggers.size > 0

    # Level 3: 3 F's
    #   OR less than 85% attendance over last 45
    #   OR 5-6 discipline actions over the last 45 school days
    tier_three_triggers = [
      (:academic if data[:course_failures] >= 3),
      (:absence if data[:recent_absence_rate] < 0.85),
      (:discipline if data[:recent_discipline_actions] >= 5)
    ].compact
    return Tier.new(3, tier_three_triggers, data) if tier_three_triggers.size > 0

    # Level 2: 2 F's
    #  OR less than 90% attendance over last 45
    #  (no discipline involved in calculation)
    tier_two_triggers = [
      (:academic if data[:course_failures] >= 2),
      (:absence if data[:recent_absence_rate] < 0.90)
    ].compact
    return Tier.new(2, tier_two_triggers, data) if tier_two_triggers.size > 0

    # Level 1: 1 F and 2 Ds
    #   OR less than 95% attendance over last 45 days
    #   (no discipline involved)
    tier_one_triggers = [
      (:academic if data[:course_failures] == 1 and data[:course_ds] >= 2),
      (:absence if data[:recent_absence_rate] < 0.95)
    ].compact
    return Tier.new(1, tier_one_triggers, data) if tier_one_triggers.size > 0

    # Level 0: Not any of the other levels
    return Tier.new(0, [], data)
  end

  private
  # TODO(kr) this could also be "days since last note"
  # so that the alerting makes sense and that there's a natural
  # "reminder" and less to parse information-wise
  def last_notes_json(student)
    last_sst_note = @authorizer.authorized do
      student.event_notes
        .where(event_note_type_id: [300])
        .where(is_restricted: false)
        .order(recorded_at: :asc)
        .last(1)
    end.first
    last_experience_note = @authorizer.authorized do
      student.event_notes
        .where(event_note_type_id: [305, 306])
        .where(is_restricted: false)
        .order(recorded_at: :asc)
        .last(1)
    end.first
    last_other_note = @authorizer.authorized do
      student.event_notes
        .where.not(event_note_type_id: [300, 305, 306])
        .where(is_restricted: false)
        .order(recorded_at: :asc)
        .last(1)
    end.first

    {
      last_sst_note: serialize_note(last_sst_note || {}),
      last_experience_note: serialize_note(last_experience_note || {}),
      last_other_note: serialize_note(last_other_note || {})
    }
  end

  def serialize_note(note)
    note.as_json(only: [:id, :event_note_type_id, :recorded_at])
  end

  def course_failures(student, options = {})
    assignments = student.student_section_assignments.select do |assignment|
      grade_numeric = assignment.grade_numeric
      grade_numeric.present? && grade_numeric < FAILING_GRADE
    end
    assignments.size
  end

  def course_ds(student, options = {})
    assignments = student.student_section_assignments.select do |assignment|
      grade_numeric = assignment.grade_numeric
      grade_numeric.present? && grade_numeric > FAILING_GRADE && grade_numeric <= 69
    end
    assignments.size
  end

  # This uses a super rough heuristic for school days.
  def recent_absence_rate(student, time_interval, time_now)
    absences_count = student.absences.where('occurred_at > ?', time_now - time_interval).size
    total_days = time_interval / 1.day
    school_days = (total_days * 5/7).round
    (school_days - absences_count) / school_days.to_f
  end

  # This doesn't actually check actions; it only looks at
  # events since we don't have actions from Aspen yet.
  def recent_discipline_actions(student, time_interval, time_now)
    discipline_events_count = student.discipline_incidents.where('occurred_at > ?', time_now - time_interval).size
    discipline_events_count
  end

  def calculate_tiering_data(student, time_now)
    {
      course_failures: course_failures(student),
      course_ds: course_ds(student),
      recent_absence_rate: recent_absence_rate(student, 45.days, time_now),
      recent_discipline_actions: recent_discipline_actions(student, 7.days, time_now)
    }
  end
end
