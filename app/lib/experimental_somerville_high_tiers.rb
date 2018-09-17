# This class is for expressing the different tiers
# of support that students should be receiving, to help
# educators catch and verify that students are getting
# the level of support and service they need.
#
# This is at experimental prototype quality.
class ExperimentalSomervilleHighTiers
  FAILING_GRADE = 65

  class Tier < Struct.new(:level, :data, :triggers)
    def self.create(level, data, triggers_with_nils)
      Tier.new(level, triggers_with_nils.compact, data)
    end

    def any_triggers?
      triggers.size > 0
    end
  end

  def initialize(educator, options = {})
    @educator = educator
    @authorizer = Authorizer.new(@educator)
    @time_interval = options.fetch(:time_interval, 45.days)

    if !PerDistrict.new.enabled_high_school_tiering?
      raise 'not enabled: PerDistrict.new.enabled_high_school_tiering?'
    end
  end

  def students_with_tiering_json(school_ids, time_now)
    cutoff_time = time_now - @time_interval

    # query for students, enforce authorization
    students = @authorizer.authorized do
      Student.active
        .where(school_id: school_ids)
        .includes(student_section_assignments: [section: :course])
        .to_a # because of AuthorizedDispatcher#filter_relation
    end
    student_ids = students.map(&:id)

    # query for absences and discipline events in batch
    absence_counts_by_student_id = Absence
      .where(student_id: student_ids)
      .where('occurred_at >= ?', cutoff_time)
      .group(:student_id)
      .count
    discipline_incident_counts_by_student_id = DisciplineIncident
      .where(student_id: student_ids)
      .where('occurred_at >= ?', cutoff_time)
      .group(:student_id)
      .count

    # Compute tiers for each student, with some querying in here still
    tiers_by_student_id = {}
    students.each do |student|
      query_results_for_student = {
        absences_count_in_period: absence_counts_by_student_id.fetch(student.id, 0),
        discipline_incident_count_in_period: discipline_incident_counts_by_student_id.fetch(student.id, 0)
      }
      tiering_data = calculate_tiering_data(student, query_results_for_student, @time_interval)
      tiers_by_student_id[student.id] = decide_tier(tiering_data)
    end

    # Optimized batch query for latest event_notes
    notes_by_student_id = most_recent_event_notes_by_student_id(student_ids, cutoff_time, {
      last_sst_note: [300],
      last_experience_note: [305, 306]
    })

    # Serialize student and section data
    students_json = students.as_json({
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

    # Merge it all back together
    students_with_tiering = students_json.map do |student_json|
      student_id = student_json['id']
      student_json.merge({
        tier: tiers_by_student_id[student_id],
        notes: notes_by_student_id[student_id]
      })
    end
    students_with_tiering.as_json
  end

  def decide_tier(data, options = {})
    # Level 4: At least 4 F's
    #   OR less than 80% attendance over last 45 school days
    #   OR 7 or more discipline actions over the last 45 school days
    tier_four = Tier.create(4, data, [
      (:academic if data[:course_failures] >= 4),
      (:attendance if data[:recent_attendance_rate] < 0.80),
      (:discipline if data[:recent_discipline_actions] >= 7)
    ])
    return tier_four if tier_four.any_triggers?

    # Level 3: 3 F's
    #   OR less than 85% attendance over last 45
    #   OR 5-6 discipline actions over the last 45 school days
    tier_three = Tier.create(3, data, [
      (:academic if data[:course_failures] >= 3),
      (:attendance if data[:recent_attendance_rate] < 0.85),
      (:discipline if data[:recent_discipline_actions] >= 5)
    ])
    return tier_three if tier_three.any_triggers?

    # Level 2: 2 F's
    #  OR less than 90% attendance over last 45
    #  (no discipline involved in calculation)
    tier_two = Tier.create(2, data, [
      (:academic if data[:course_failures] >= 2),
      (:attendance if data[:recent_attendance_rate] < 0.90)
    ])
    return tier_two if tier_two.any_triggers?

    # Level 1: 1 F and 2 Ds
    #   OR less than 95% attendance over last 45 days
    #   (no discipline involved)
    tier_one = Tier.create(1, data, [
      (:academic if data[:course_failures] == 1 and data[:course_ds] >= 2),
      (:attendance if data[:recent_attendance_rate] < 0.95)
    ])
    return tier_one if tier_one.any_triggers?

    # Level 0: Not any of the other levels
    return Tier.create(0, data, [])
  end

  private
  # query_map is {:result_key => [event_note_type_id]}
  def most_recent_event_notes_by_student_id(student_ids, cutoff_time, query_map)
    notes_by_student_id = {}

    # query across all students and note types
    all_event_note_type_ids = query_map.values.flatten.uniq
    partial_event_notes = EventNote
      .where(student_id: student_ids)
      .where('recorded_at >= ?', cutoff_time)
      .where(event_note_type_id: all_event_note_type_ids)
      .where(is_restricted: false)
      .select('student_id, event_note_type_id, max(recorded_at) as most_recent_recorded_at')
      .group(:student_id, :event_note_type_id)

    # merge them together and serialize
    sorted_partial_event_notes = partial_event_notes.sort_by(&:most_recent_recorded_at).reverse
    student_ids.each do |student_id|
      notes_for_student = {}
      query_map.each do |key, event_note_type_ids|
        # find the most recent note for this kind, we can use find because the list is sorted
        matching_partial_note = sorted_partial_event_notes.find do |partial_event_note|
          matches_student_id = partial_event_note.student_id == student_id
          matches_event_note_type_id = event_note_type_ids.include?(partial_event_note.event_note_type_id)
          matches_student_id && matches_event_note_type_id
        end

        # serialize notes for a student
        if matching_partial_note.nil?
          notes_for_student[key] = {}
        else
          notes_for_student[key] = {
            # TODO(kr) maybe need id here?
            event_note_type_id: matching_partial_note.event_note_type_id,
            recorded_at: matching_partial_note.most_recent_recorded_at
          }
        end
      end
      notes_for_student[:last_other_note] = {} # TODO(kr) remove
      notes_by_student_id[student_id] = notes_for_student
    end
    notes_by_student_id
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
  def recent_attendance_rate(absences_count_in_period, time_interval)
    total_days = time_interval / 1.day
    school_days = (total_days * 5/7).round
    (school_days - absences_count_in_period) / school_days.to_f
  end

  # This doesn't actually check actions for discipline; it only looks at
  # events since we don't have actions from Aspen yet.
  def calculate_tiering_data(student, query_results_for_student, time_interval)
    absences_count_in_period = query_results_for_student.fetch(:absences_count_in_period)
    discipline_incident_count_in_period = query_results_for_student.fetch(:discipline_incident_count_in_period)
    {
      course_failures: course_failures(student),
      course_ds: course_ds(student),
      recent_attendance_rate: recent_attendance_rate(absences_count_in_period, time_interval),
      recent_discipline_actions: discipline_incident_count_in_period
    }
  end
end
