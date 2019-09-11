class StudentSectionGradesImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_SIS_SFTP_CSV,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [
        DataFlow::OPTION_SCHOOL_SCOPE
      ],
      merge: DataFlow::MERGE_UPDATE_IGNORE_UNMARKED,
      touches: [
        StudentSectionAssignment.name,
        HistoricalGrade.name
      ],
      description: 'SIS current computer grades for courses.  These may change over time, and primary keys may be recycled in some circumstances.'
    })
  end

  # Most of our file importer classes match to a SQL file in the /x2_export folder.
  # Somerville IT uses the SQL to export data  nightly, and Rails imports nightly.

  # The StudentSectionGradesImporter is a bit different. It has no matching SQL export
  # file, because its CSV gets delivered by Aspen nightly, using a custom routine
  # they created on their back end.

  # The CSV output of the custom Aspen routine doesn't include headers, so we
  # specify them explicitly here:
  CSV_HEADERS = [
    'section_number',
    'student_local_id',
    'school_local_id',
    'course_number',
    'term_local_id',
    'grade'
  ]

  def initialize(options:)
    @school_scope = options.fetch(:school_scope)
    @district_school_year = options.fetch(:district_school_year, default_district_school_year)
    @log = options.fetch(:log)

    @student_ids_map = ::StudentIdsMap.new
    @section_number_map = {}
    reset_counters!
  end

  def import
    return log('No remote_file_name, aborting.') unless remote_file_name

    log('Downloading...')
    streaming_csv = download_csv

    log('Building student_ids_map...')
    @student_ids_map.reset!
    log("@student_ids_map built with #{@student_ids_map.size} local_id keys")

    log('Building section_number_map...')
    @section_number_map = build_section_number_map()
    log("@section_number_map built with #{@section_number_map.size} keys")

    log('Starting loop...')
    streaming_csv.each_with_index do |row, index|
      import_row(row) if filter.include?(row[:school_local_id])
    end
    log('Done loop.')

    log("@invalid_student_count: #{@invalid_student_count}")
    log("@invalid_rows_count: #{@invalid_rows_count}")
    log("@section_not_found_in_index_count: #{@section_not_found_in_index_count}")
  end

  private
  def reset_counters!
    @invalid_student_count = 0
    @section_not_found_in_index_count = 0
    @invalid_rows_count = 0
  end

  # Assume all grades are referencing sections within the current district_school_year,
  # based on wall clock and Insights school year cutoff.
  # Ideally, this would be exported explicitly.
  def default_district_school_year(options = {})
    time_now = options.fetch(:time_now, Time.now)
    school_year_now = SchoolYear.to_school_year(time_now)
    school_year_now + 1 # convert from insights to `district_school_year`
  end

  # The export doesn't include data to match to a specific school year, so as a shortcut
  # build the index with only the current `district_school_year` based on the wall clock.
  def build_section_number_map
    Section.where(district_school_year: @district_school_year)
      .joins(course: :school)
      .select(*[
        "sections.id",
        "sections.section_number",
        "sections.term_local_id",
        "schools.local_id as school_local_id",
        "courses.course_number",
        "sections.district_school_year"
      ])
      .map{|section| [make_section_key_for_row(section.attributes.symbolize_keys), section.id] }
      .to_h
  end

  def remote_file_name
    PerDistrict.new.try_sftp_filename('FILENAME_FOR_STUDENT_AVERAGES_IMPORT')
  end

  def download_csv
    client = SftpClient.for_x2
    data_transformer = StreamingCsvTransformer.new(@log, headers: CSV_HEADERS)
    CsvDownloader.new({
      log: @log,
      remote_file_name: remote_file_name,
      client: client,
      transformer: data_transformer
    }).get_data
  end

  def filter
    SchoolFilter.new(@school_scope)
  end

  def import_row(row)
    # find student
    student_id = row[:student_local_id].nil? ? nil : @student_ids_map.lookup_student_id(row[:student_local_id])
    if student_id.nil?
      @invalid_student_count += 1
      return nil
    end

    # lookup the section in the index, using the current `district_school_year`
    # based on the wall clock since it isn't explicit in the export.
    row_with_district_school_year = row.to_h.merge(district_school_year: @district_school_year)
    section_key = make_section_key_for_row(row_with_district_school_year)
    section_id = @section_number_map.fetch(section_key, nil)
    if section_id.nil?
      @section_not_found_in_index_count += 1
      return nil
    end

    student_section_assignment = StudentSectionGradeRow.new(row, student_id, section_id).build
    if student_section_assignment.nil?
      @invalid_rows_count += 1
      return nil
    end

    # update
    student_section_assignment.save!

    # also store a historical record
    if student_id && section_id
      HistoricalGrade.create!({
        student_id: student_id,
        section_id: section_id,
        section_number: row[:section_number],
        course_number: row[:course_number],
        grade: row[:grade]
      })
    end
  end

  def find_student_id(maybe_lasid)
    return nil unless maybe_lasid
    @student_ids_map.lookup_student_id(maybe_lasid)
  end

  def make_section_key_for_row(row)
    [
      row[:district_school_year],
      row[:term_local_id],
      row[:school_local_id],
      row[:course_number],
      row[:section_number]
    ].join('|')
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentSectionGradesImporter: #{text}"
  end
end
