class StudentVoiceSurveyImporter
  def self.data_flow
    DataFlow.new({
      importer: self.name,
      source: DataFlow::SOURCE_GOOGLE_DRIVE_SHEET,
      frequency: DataFlow::FREQUENCY_DAILY,
      options: [],
      merge: DataFlow::MERGE_APPEND_ONLY,
      touches: [
        StudentVoiceSurveyUpload.name,
        StudentVoiceCompleted2020Survey.name
      ],
      description: 'Import student voice surveys, append-only style, by reading sheet generated from Google Form'
    })
  end

  def initialize(options:)
    @log = options.fetch(:log, STDOUT)
    @time_now = options.fetch(:time_now, Time.now)
    @fetcher = options.fetch(:fetcher, GoogleSheetsFetcher.new)
  end

  def import
    if !PerDistrict.new.student_voice_survey_importer_enabled?
      log('Aborting since not enabled...')
      return
    end

    log('  fetching tab...')
    sheet_id = read_sheet_id_from_env()
    tab = fetch_tab(sheet_id)
    if tab.nil?
      raise 'fetch_tab returned nil'
    end

    log('  creating StudentVoiceSurveyUploader...')
    upload_attrs = {
      file_name: "#{tab.spreadsheet_name} - #{tab.tab_name}",
      uploaded_by_educator_id: read_uploaded_by_educator_id_from_env()
    }
    uploader = StudentVoiceSurveyUploader.new(tab.tab_csv, upload_attrs, log: @log)
    log('  calling StudentVoiceSurveyUploader#create_from_text!...')
    student_voice_survey_upload = uploader.create_from_text!
    log('  done #create_from_text!')
    log("  student_voice_survey_upload.id: #{student_voice_survey_upload.id}")
    log("  student_voice_survey_upload.student_voice_completed_surveys.size: #{student_voice_survey_upload.student_voice_completed_surveys.size}")
    log("StudentVoiceSurveyUploader#stats: #{uploader.stats}")

    nil
  end

  def dry_run
    raise 'Not implemented; refactor StudentVoiceSurveyUploader to enable this.'
  end

  private
  def read_uploaded_by_educator_id_from_env
    educator_login_name = ENV.fetch('STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME', '')
    uploaded_by_educator_id = Educator.find_by_login_name(educator_login_name).try(:id)
    raise '#read_uploaded_by_educator_id_from_env found nil' if uploaded_by_educator_id.nil?
    uploaded_by_educator_id
  end

  def read_sheet_id_from_env
    sheet_id = PerDistrict.new.imported_google_folder_ids('student_voice_survey_importer_sheet_id')
    raise '#read_sheet_id_from_env found nil' if sheet_id.nil?
    sheet_id
  end

  def fetch_tab(sheet_id)
    tabs = @fetcher.get_tabs_from_sheet(sheet_id)
    return nil if tabs.size != 1
    tabs.first
  end

  def log(msg)
    text = if msg.class == String then msg else JSON.pretty_generate(msg) end
    @log.puts "StudentVoiceSurveyImporter: #{text}"
  end
end
