require 'csv'

# Get flat CSVs to ship to Research Matters:
#
# puts ResearchMattersExporter.new.student_file
# puts ResearchMattersExporter.new.teacher_file

class ResearchMattersExporter

  STUDENT_INCLUDES = %w[school absences discipline_incidents event_notes]
  SCHOOL_LOCAL_IDS = %w[BRN HEA KDY AFAS ESCS WSNS WHCS]

  def initialize(options: {
                  mixpanel_downloader: RawMixpanelDataDownloader.new,
                  canonical_domain: ENV['CANONICAL_DOMAIN']
                })

    @school_ids = School.where(local_id: SCHOOL_LOCAL_IDS).pluck(:id)
    @students = Student.where(school_id: @school_ids).includes(STUDENT_INCLUDES)
    @educators = Educator.where(school_id: @school_ids)

    @focal_time_period_start = DateTime.new(2017, 8, 28)
    @focal_time_period_end = DateTime.new(2017, 12, 24)

    @mixpanel_downloader = options[:mixpanel_downloader]
    @canonical_domain = options[:canonical_domain]

    if !PerDistrict.new.is_research_matters_analysis_supported?
      raise 'not enabled: PerDistrict.new.is_research_matters_analysis_supported?'
    end
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
      pageview_count
    ].join(',')
  end

  def teacher_file_headers
    %w[
      educator_id
      email
      first_name
      last_name
      school_id
      notes_added
      notes_revised
      notes_total
      total_student_count
      focal_student_count
      pageview_count
    ].join(',')
  end

  def student_rows
    ids_to_pageview_count = student_ids_to_pageview_count

    @students.map do |student|
      absence_indicator = student_to_indicator(student.id, Absence, 12)
      discipline_indicator = student_to_indicator(student.id, DisciplineIncident, 5)
      sst_indicator = combine_indicators(absence_indicator, discipline_indicator)
      notes_added = student_to_notes_added(student.id)
      notes_revised = student_to_notes_revised(student.id)
      notes_total = notes_added + notes_revised
      educator_id = student.homeroom.try(:educator_id)
      educator_count = educator_id.present? ? 1 : 0

      [
        student.id,
        student.school.try(:local_id),
        absence_indicator,
        discipline_indicator,
        sst_indicator,
        notes_added,
        notes_revised,
        notes_total,
        educator_id,
        educator_count,
        ids_to_pageview_count[student.id.to_s],
      ].join(',')
    end
  end

  def teacher_rows
    ids_to_pageview_count = educator_ids_to_pageview_count

    @educators.map do |educator|
      full_name = educator.full_name
      last_name = full_name.present? ? full_name.split(", ")[0] : nil
      first_name = full_name.present? ? full_name.split(", ")[1] : nil
      notes_added = educator_to_notes_added(educator.id)
      notes_revised = educator_to_notes_revised(educator.id)
      notes_total = notes_added + notes_revised
      total_student_count = educator_to_total_student_count(educator)
      focal_student_count = educator_to_focal_sstudent_count(educator)

      [
        educator.id,
        educator.email,
        first_name,
        last_name,
        educator.school.try(:local_id),
        notes_added,
        notes_revised,
        notes_total,
        total_student_count,
        focal_student_count,
        ids_to_pageview_count[educator.id]
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

    (count >= limit) ? '1' : '0'
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

  def educator_to_notes_added(educator_id)
    EventNote.where(educator_id: educator_id, event_note_type_id: 300)
             .select { |event| filter_event_occurred_at(event, 'recorded_at') }
             .count
  end

  def educator_to_notes_revised(educator_id)
    EventNoteRevision.where(educator_id: educator_id, event_note_type_id: 300)
             .select { |event| filter_event_occurred_at(event, 'created_at') }
             .count
  end

  def educator_to_total_student_count(educator)
    return 0 if educator.homeroom.nil?

    return educator.homeroom.students.count
  end

  def educator_to_focal_sstudent_count(educator)
    return 0 if educator.homeroom.nil?

    return educator.homeroom.students.select { |student| is_sst(student) }.count
  end

  def is_sst(student)
    absence_indicator = student_to_indicator(student.id, Absence, 12)
    discipline_indicator = student_to_indicator(student.id, DisciplineIncident, 5)

    return true if absence_indicator == '1' || discipline_indicator == '1'

    return false
  end

  def combine_indicators(absence_indicator, discipline_indicator)
    return '1' if absence_indicator == '1' || discipline_indicator == '1'

    return '0'
  end

  def student_ids_to_pageview_count
    viewed_students = student_profile_pageviews.map do |pageview_record|
      url = pageview_record['properties']['$current_url']

      url.gsub!("https://#{@canonical_domain}/students/", "")
      id = url.split("?")[0]
              .split("#")[0]
      id
    end

    ids_to_view_count = viewed_students.each_with_object(Hash.new(0)) do |id, memo|
      memo[id] += 1
    end

    return ids_to_view_count
  end

  def educator_ids_to_pageview_count
    educator_ids = student_profile_pageviews.map do |pageview_record|
      pageview_record['properties']['educator_id']
    end

    ids_to_view_count = educator_ids.each_with_object(Hash.new(0)) do |id, memo|
      memo[id] += 1
    end

    return ids_to_view_count
  end

  def student_profile_pageviews
    @student_profile_page_views ||= student_profile_events.select do |event|
      event['event'] == 'PAGE_VISIT'
    end

    log "Got #{@student_profile_page_views.size} student profile page views."

    @student_profile_page_views
  end

  def student_profile_events
    @student_profile_events = filtered_event_data.select do |event|
      event['properties']['page_key'] == 'STUDENT_PROFILE'
    end

    log "Got #{@student_profile_events.size} student profile events."

    @student_profile_events
  end

  def filtered_event_data
    deployment_filtered_event_data = event_data.select do |event|
      event['properties']['deployment_key'] == "production"
    end

    log "Got #{deployment_filtered_event_data.size} events after filtering out demo site."

    @filtered_event_data = deployment_filtered_event_data.select do |event|
      filter_out_test_accounts(event)
    end

    log "Got #{@filtered_event_data.size} events after filtering out test educators and Uri."

    @filtered_event_data
  end

  def event_data
    @event_data ||= @mixpanel_downloader.event_data
    log ""
    log "Got #{@event_data.size} raw events."
    @event_data
  end

  def filter_out_test_accounts(event)
    educator_id = event['properties']['educator_id']

    return false if educator_id == ENV['TEST_USER_ID_ONE'].to_i
    return false if educator_id == ENV['TEST_USER_ID_TWO'].to_i
    return false if educator_id == ENV['URI_ID'].to_i
    return true
  end

  def log(message)
    puts message unless Rails.env.test?
  end

end
