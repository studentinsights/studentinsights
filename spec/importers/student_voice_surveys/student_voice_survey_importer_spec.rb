require 'rails_helper'

RSpec.describe StudentVoiceSurveyImporter do
  let!(:pals) { TestPals.create! }

  def create_mock_fetcher_from_map(sheet_id_to_tab_map)
    mock_fetcher = GoogleSheetsFetcher.new
    allow(GoogleSheetsFetcher).to receive(:new).and_return(mock_fetcher)
    sheet_id_to_tab_map.each do |sheet_id, tabs|
      allow(mock_fetcher).to receive(:get_tabs_from_sheet).with(sheet_id).and_return(tabs)
    end
    mock_fetcher
  end

  def create_mock_fetcher
    create_mock_fetcher_from_map({
      'mock_sheet_id_A' => [GoogleSheetsFetcher::Tab.new({
        spreadsheet_id: 'student-voice-survey-fall',
        spreadsheet_name: 'Fall Student Voice Survey',
        spreadsheet_url: 'https://example.com/student-voice-fall',
        tab_id: '123456',
        tab_name: 'Form responses',
        tab_csv: IO.read("#{Rails.root}/spec/fixtures/student_voice_survey_v2.csv")
      })]
    })
  end

  # Remove some TestPals setup
  def clear_db!
    StudentVoiceSurveyUpload.all.destroy_all
    StudentVoiceCompletedSurvey.all.destroy_all
  end

  def create_importer_with_fetcher_mocked(options = {})
    log = LogHelper::FakeLog.new
    fetcher = create_mock_fetcher()
    importer = StudentVoiceSurveyImporter.new(options: {
      log: log,
      fetcher: fetcher,
      time_now: pals.time_now
    }.merge(options))

    [importer, log]
  end

  it 'raises on call to dry_run' do
    importer, _ = create_importer_with_fetcher_mocked(sheet_id: 'mock_sheet_id_A')
    expect { importer.dry_run }.to raise_error(RuntimeError, 'Not implemented; refactor StudentVoiceSurveyUploader to enable this.')
  end

  it 'aborts if env not setup' do
    clear_db!
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
    importer, log = create_importer_with_fetcher_mocked(sheet_id: 'mock_sheet_id_A')
    importer.import

    expect(log.output).to include('Aborting')
    expect(StudentVoiceSurveyUpload.all.size).to eq 0
    expect(StudentVoiceCompletedSurvey.all.size).to eq 0
  end

  context 'with empty db, and env setup for test' do
    before do
      clear_db!
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::SOMERVILLE))

      @STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME = ENV['STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME']
      @IMPORTED_GOOGLE_FOLDER_IDS_JSON = ENV['IMPORTED_GOOGLE_FOLDER_IDS_JSON']
      ENV['IMPORTED_GOOGLE_FOLDER_IDS_JSON'] = '{"student_voice_survey_importer_sheet_id":"mock_sheet_id_A"}'
      ENV['STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = 'jodi'
    end

    after do
      ENV['IMPORTED_GOOGLE_FOLDER_IDS_JSON'] = @IMPORTED_GOOGLE_FOLDER_IDS_JSON
      ENV['STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = @login_name
    end

    it 'raises if it cannot find uploaded_by_educator_id from env' do
      ENV['STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = ''
      importer, _ = create_importer_with_fetcher_mocked(sheet_id: 'mock_sheet_id_A')
      expect { importer.send(:read_uploaded_by_educator_id_from_env) }.to raise_error RuntimeError
    end

    it 'reads in value for uploaded_by_educator_id correctly' do
      ENV['STUDENT_VOICE_SURVEY_IMPORTER_UPLOADED_BY_EDUCATOR_LOGIN_NAME'] = 'jodi'
      importer, _ = create_importer_with_fetcher_mocked(sheet_id: 'mock_sheet_id_A')
      expect(importer.send(:read_uploaded_by_educator_id_from_env)).to eq pals.shs_jodi.id
    end

    it 'works on happy path, with sheet_id passed, and fetcher mocked' do
      importer, log = create_importer_with_fetcher_mocked(sheet_id: 'mock_sheet_id_A')

      expect(StudentVoiceSurveyUpload.all.size).to eq 0
      expect(StudentVoiceCompletedSurvey.all.size).to eq 0
      importer.import
      expect(log.output).to include(':created_records_count=>1')
      expect(StudentVoiceSurveyUpload.all.size).to eq 1
      expect(StudentVoiceCompletedSurvey.all.size).to eq 1
      expect(StudentVoiceCompletedSurvey.pluck(:student_id)).to eq [pals.shs_freshman_mari.id]
      expect(StudentVoiceSurveyUpload.pluck(:uploaded_by_educator_id)).to eq [pals.shs_jodi.id]
      most_recent_survey_json = StudentVoiceCompletedSurvey.most_recent_fall_student_voice_survey(pals.shs_freshman_mari.id).as_json(except: [
        :id,
        :student_voice_survey_upload_id,
        :created_at,
        :updated_at
      ])
      expect(most_recent_survey_json).to eq({
        "student_id"=> pals.shs_freshman_mari.id,
        "form_timestamp" => '2018-08-12T10:28:23.000Z',
        "first_name" => "Mari",
        "student_lasid" => pals.shs_freshman_mari.local_id,
        "proud" => "Stole the most bases in the league this year",
        "best_qualities" => "Thoughtful and think before I just open my mouth",
        "activities_and_interests" => "Making podcasts, teaching my sister songs",
        "nervous_or_stressed" => "when there is too much work and I don't know what to do",
        "learn_best" => "are kind and explain what we need to do to get good grades"
      })
    end
  end
end
