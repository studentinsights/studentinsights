require 'csv'

class ResearchMattersExporter

  STUDENT_INCLUDES = %w[school absences discipline_incidents event_notes]

  def initialize
    @school = School.find_by_local_id('HEA')
    @students = @school.students.includes(STUDENT_INCLUDES)
    @educators = @school.educators

    @focal_time_period_start = DateTime.new(2017, 8, 28)
    @focal_time_period_end = DateTime.new(2017, 12, 24)
  end

  def student_file
    [student_file_headers, student_rows].flatten
  end

  def teacher_file
    [teacher_file_headers, teacher_rows].flatten
  end

  private

  def student_file_headers
    %w[
      student_id
      school_id
      absence_indicator
      discipline_indicator
      sst_indicator
      notes_added
      notes_revised
      notes_total
    ].join(',')
  end

  def teacher_file_headers
    %w[
      educator_id
      email
      full_name
      school_id
    ].join(',')
  end

  def student_rows
    @students.map do |student|
      absence_indicator = student_to_indicator(student.id, Absence, 12)
      discipline_indicator = student_to_indicator(student.id, DisciplineIncident, 5)
      sst_indicator = student_to_sst_indicator(absence_indicator, discipline_indicator)
      notes_added = student_to_notes_added(student.id)
      notes_revised = student_to_notes_revised(student.id)
      notes_total = notes_added + notes_revised

      [
        student.id,
        'HEA',
        absence_indicator,
        discipline_indicator,
        sst_indicator,
        notes_added,
        notes_revised,
        notes_total,
      ].join(',')
    end
  end

  def teacher_rows
    @educators.map do |educator|
      [
        educator.id,
        educator.email,
        educator.full_name,
        'HEA'
      ]
    end
  end

  def filter_event_occurred_at(event, attribute_name)
    occurred_at = event.send(attribute_name)
    filter_from = @focal_time_period_start
    filter_to = @focal_time_period_end

    (occurred_at > filter_from) && (occurred_at < filter_to)
  end

  def student_to_indicator(student_id, focal_class, limit)
    count = focal_class.where(student_id: student_id)
                       .select { |event| filter_event_occurred_at(event, 'occurred_at') }
                       .count

    (count >= limit) ? '1' : 0
  end

  def student_to_notes_added(student_id)
    EventNote.where(student_id: student_id, event_note_type_id: 300)
             .select { |event| filter_event_occurred_at(event, 'recorded_at') }
             .count
  end

  def student_to_notes_revised(student_id)
    EventNoteRevision.where(student_id: student_id, event_note_type_id: 300)
             .select { |event| filter_event_occurred_at(event, 'created_at') }
             .count
  end

  def student_to_sst_indicator(absence_indicator, discipline_indicator)
    return '1' if absence_indicator == '1' || discipline_indicator == '1'

    return '0'
  end

end
