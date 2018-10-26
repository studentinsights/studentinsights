# Used on the console to import student meetings.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# output = StudentMeetingImporter.new.import(file_text);nil
class StudentMeetingImporter
  # We ran into a crazy bug with Google Forms - the data within a field
  # was inaccurate in the Forms UI (both responses and individual) and in the file from
  # "download CSV" - but if you exported that form into a Google Sheet, you'd see the
  # correct full data in that field.  This came up since the views from Forms were truncating
  # the student's local id.
  #
  # So this is written to export the data as a sheet; then download that as a CSV.
  # This matters because the Forms download CSV uses "Username" for the educator email,
  # but when exporting to Sheets it translates that to "Email Address".
  READER_OPTIONS = {
    source_key: 'student_meeting',
    config: {
      student_local_id: 'Student Local ID Number',
      educator_email: 'Email Address',
      timestamp: 'Timestamp',
      strptime_format: SurveyReader::GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT,
      ignore_keys: [
        'Student Name',
        'Teacher Name'
      ]
    }
  }
  def initialize(options = {})
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
  end

  def import(file_text, options = {})
    # Read the CSV
    survey = parse_rows(file_text, options)
    log "reader#stats: #{survey[:stats]}"

    # Translate survey to generic EventNote hashes, and then do an exact sync
    importer = FlatNoteImporter.new(log: @log)
    hashes_for_notes = importer.generic_hashes_for_notes(note_title, survey[:parsed_rows])
    syncer = importer.exact_sync_using_note_title(note_title, hashes_for_notes)
    log "syncer#stats: #{syncer.stats}"

    [survey, syncer] # return for debugging
  end

  private
  def note_title
    'NGE/10GE/NEST Student Meeting'
  end

  def parse_rows(file_text, options = {})
    reader = SurveyReader.new(file_text, options.merge(READER_OPTIONS))
    reader.parse_rows
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentMeetingImporter: #{text}"
  end
end
