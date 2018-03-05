require 'csv'

# Get flat CSVs to ship to Research Matters:
#
# puts ResearchMattersExporter.new.student_file
# puts ResearchMattersExporter.new.teacher_file

class ResearchMattersExporter

  STUDENT_INCLUDES = %w[school absences discipline_incidents event_notes]

  def initialize(mixpanel_downloader = RawMixpanelDataDownloader.new)
    @school = School.find_by_local_id('HEA')
    @students = @school.students.includes(STUDENT_INCLUDES)
    @educators = @school.educators

    @focal_time_period_start = DateTime.new(2017, 8, 28)
    @focal_time_period_end = DateTime.new(2017, 12, 24)

    @mixpanel_downloader = mixpanel_downloader
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
      educator_id
      educator_count
    ].join(',')
  end

  def teacher_file_headers
    %w[
      educator_id
      email
      first_name
      last_name
      school_id
    ].join(',')
  end

  def student_rows
    pageview_counts
    @students.map do |student|
      absence_indicator = student_to_indicator(student.id, Absence, 12)
      discipline_indicator = student_to_indicator(student.id, DisciplineIncident, 5)
      sst_indicator = student_to_sst_indicator(absence_indicator, discipline_indicator)
      notes_added = student_to_notes_added(student.id)
      notes_revised = student_to_notes_revised(student.id)
      notes_total = notes_added + notes_revised
      educator_id = student.homeroom.try(:educator_id)
      educator_count = educator_id.present? ? 1 : 0

      [
        student.id,
        'HEA',
        absence_indicator,
        discipline_indicator,
        sst_indicator,
        notes_added,
        notes_revised,
        notes_total,
        educator_id,
        educator_count
      ].join(',')
    end
  end

  def teacher_rows
    @educators.map do |educator|
      full_name = educator.full_name
      last_name = full_name.present? ? full_name.split(", ")[0] : nil
      first_name = full_name.present? ? full_name.split(", ")[1] : nil

      [
        educator.id,
        educator.email,
        first_name,
        last_name,
        'HEA'
      ].join(',')
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

  def pageview_counts
    @pageview_counts ||= @mixpanel_downloader.pageview_counts
  end

end
