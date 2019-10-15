# For importing student meeting data from Google Sheets (not the form directly).
class StudentMeetingImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_SHEET,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [],
      merge: DataFlow::MERGE_UPDATE_DELETE_UNMARKED,
      touches: [
        EventNote.name
      ],
      description: 'Import forms from student meetings, from a Google Sheet produced by a particular form'
    })
  end

  def initialize(options:)
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @school_year = options.fetch(:school_year, SchoolYear.to_school_year(Time.now))
    @explicit_sheet_id = options.fetch(:explicit_sheet_id, nil)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new(log: @log))
  end

  def import
    if !PerDistrict.new.student_meeting_importer_enabled?
      log('Aborting since not enabled...')
      return
    end

    log('Fetching tabs...')
    csv_text = get_csv_text_from_sheet()
    log("Found CSV text with #{csv_text.size} bytes.")

    # Read the CSV
    survey = parse_rows(csv_text)
    log "reader#stats.to_json: #{survey[:stats].to_json}"

    # Translate survey to generic EventNote hashes, and then do an exact sync
    importer = FlatNoteImporter.new(log: @log)
    hashes_for_notes = importer.generic_hashes_for_notes(note_title, survey[:parsed_rows])
    syncer = importer.exact_sync_using_note_title(note_title, hashes_for_notes)
    log("Sync stats.to_json: #{syncer.stats.to_json}")

    log("Done.")
  end

  private
  # An improvement here would be to scope to the school year, as a conservative strategy
  # for isolation (eg, in case educator clears out previous year's in sheet).
  # That would also require filtering the parsed_rows first to match that more limited
  # scope as well.
  def note_title
    "NGE/10GE/NEST Student Meeting"
  end

  def get_csv_text_from_sheet
    sheet_id = @explicit_sheet_id.present? ? @explicit_sheet_id : read_sheet_id_from_env()
    tabs = @fetcher.get_tabs_from_sheet(sheet_id)
    raise "unexpected number of tabs found: #{tabs.size}" if tabs.size != 1
    tabs.first.tab_csv
  end

  def read_sheet_id_from_env
    sheet_id = PerDistrict.new.imported_google_folder_ids('student_meeting_importer_sheet_id')
    raise '#read_sheet_id_from_env found nil' if sheet_id.nil?
    sheet_id
  end

  # We ran into a crazy bug with Google Forms - the data within a field
  # was inaccurate in the Forms UI (both responses and individual) and in the file from
  # "download CSV" - but if you exported that form into a Google Sheet, you'd see the
  # correct full data in that field.  This came up since the views from Forms were truncating
  # the student's local id.
  #
  # So this is written to export the data as a sheet; then download that as a CSV.
  # This matters because the Forms download CSV uses "Username" for the educator email,
  # but when exporting to Sheets it translates that to "Email Address".
  def parse_rows(file_text)
    reader = SurveyReader.new(file_text, {
      source_key: 'student_meeting',
      config: {
        student_local_id: 'Student Local ID Number',
        educator_email: 'Email Address',
        timestamp: 'Timestamp',
        ignore_keys: [
          'Student Name',
          'Teacher Name'
        ]
      }
    })
    reader.parse_rows
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentMeetingImporter: #{text}"
  end
end
