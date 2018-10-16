# Used on the console to import student meetings
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# output = StudentMeetingImporter.new.import(file_text);nil
class StudentMeetingImporter
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
    reader = SurveyReader.new(file_text, options.merge({
      source_key: 'student_meeting',
      config: {
        student_local_id: 'Local Student ID Number',
        educator_email: 'Username',
        timestamp: 'Timestamp',
        ignore_keys: [
          'Student First and Last Name',
          'Q1 IPR meeting with (add teacher name below)'
        ]
      }
    }))
    reader.parse_rows
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentMeetingImporter: #{text}"
  end
end