require 'rails_helper'

RSpec.describe StudentMeetingImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/student_meeting/student_meeting_fixture.csv")
  end

  def create_mock_fetcher_from_map(sheet_id_to_tab_map)
    mock_fetcher = GoogleSheetsFetcher.new
    allow(GoogleSheetsFetcher).to receive(:new).and_return(mock_fetcher)
    sheet_id_to_tab_map.each do |sheet_id, tabs|
      allow(mock_fetcher).to receive(:get_tabs_from_sheet).with(sheet_id).and_return(tabs)
    end
    mock_fetcher
  end

  def create_importer_with_fixture(mock_sheet_id, file_text)
    log = LogHelper::FakeLog.new
    mock_fetcher = create_mock_fetcher_from_map({
      mock_sheet_id => [GoogleSheetsFetcher::Tab.new({
        spreadsheet_id: 'student-meeting-sheet',
        spreadsheet_name: 'NGE/10GE/NEST Student Meeting (Responses)',
        spreadsheet_url: 'https://example.com/student-meeting-sheet',
        tab_id: '123456789',
        tab_name: 'Form responses',
        tab_csv: file_text
      })]
    })
    importer = StudentMeetingImporter.new(options: {
      log: log,
      fetcher: mock_fetcher
    })
    allow(importer).to receive(:read_sheet_id_from_env).and_return(mock_sheet_id)
    [importer, log]
  end


  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works for importing notes' do
      importer, _ = create_importer_with_fixture('mock_sheet_id_Z', fixture_file_text())
      importer.import

      expect(EventNote.pluck(:event_note_type_id, :is_restricted).uniq).to eq([[304, false]])
      expect(EventNote.all.as_json(only: [:student_id, :educator_id, :text])).to contain_exactly(*[
        {
          'student_id' => pals.shs_freshman_mari.id,
          'educator_id' => pals.shs_jodi.id,
          'text' => include("NGE/10GE/NEST Student Meeting\n\nWhat classes are you doing well in?\nFrench, Algebra and Pottery")
        }, {
          'student_id' => pals.shs_senior_kylo.id,
          'educator_id' => pals.shs_hugo_art_teacher.id,
          'text' => include("NGE/10GE/NEST Student Meeting\n\nWhat classes are you doing well in?\nEnglish, History, and Math")
        }
      ])
      expect(importer.stats[:syncer]).to eq({
        total_sync_calls_count: 2,
        created_rows_count: 2,
        destroyed_records_count: 0,
        invalid_rows_count: 0,
        marked_ids_count: 2,
        passed_nil_record_count: 0,
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        has_processed_unmarked_records: true,
        validation_failure_counts_by_field: {},
      })
    end

    it 'does not update unchanged records from previous import' do

      # first run
      first_importer, _ = create_importer_with_fixture('mock_sheet_id_Z', fixture_file_text())
      first_importer.import
      expect(first_importer.stats[:syncer]).to eq({
        total_sync_calls_count: 2,
        created_rows_count: 2,
        destroyed_records_count: 0,
        invalid_rows_count: 0,
        marked_ids_count: 2,
        passed_nil_record_count: 0,
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        has_processed_unmarked_records: true,
        validation_failure_counts_by_field: {},
      })
      first_records_json = EventNote.all.as_json
      expect(first_records_json.size).to eq 2

      # second run
      second_importer, _ = create_importer_with_fixture('mock_sheet_id_Z', fixture_file_text())
      second_importer.import
      expect(second_importer.stats[:syncer]).to eq({
        total_sync_calls_count: 2,
        created_rows_count: 0,
        destroyed_records_count: 0,
        invalid_rows_count: 0,
        marked_ids_count: 2,
        passed_nil_record_count: 0,
        unchanged_rows_count: 2,
        updated_rows_count: 0,
        has_processed_unmarked_records: true,
        validation_failure_counts_by_field: {},
      })
      second_records_json = EventNote.all.as_json
      expect(second_records_json).to eq first_records_json
    end

    it 'does not impact other existing notes' do
      4.times { FactoryBot.create(:event_note) }

      importer, _ = create_importer_with_fixture('mock_sheet_id_Z', fixture_file_text())
      importer.import
      expect(importer.stats[:syncer]).to eq({
        total_sync_calls_count: 2,
        created_rows_count: 2,
        destroyed_records_count: 0,
        invalid_rows_count: 0,
        marked_ids_count: 2,
        passed_nil_record_count: 0,
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        has_processed_unmarked_records: true,
        validation_failure_counts_by_field: {},
      })
      expect(EventNote.all.size).to eq 6
    end

    it 'can map email addresses when Google email address does not match Insights email address' do
      mock_per_district = PerDistrict.new
      allow(mock_per_district).to receive(:google_email_address_mapping).and_return({
        "fatima_google@demo.studentinsights.org" => "fatima@demo.studentinsights.org"
      })
      allow(PerDistrict).to receive(:new).and_return(mock_per_district)

      file_text = fixture_file_text.split("\n").first + "\n" + '"03/05/2018 08:11:11","fatima_google@demo.studentinsights.org","Amir Solo","Fatima Teacher","2222222211   ","Biology, Spanish","one","two","three","four","five","six","seven"'
      importer, _ = create_importer_with_fixture('mock_sheet_id_z', file_text)
      importer.import
      expect(importer.stats[:syncer]).to eq({
        total_sync_calls_count: 1,
        created_rows_count: 1,
        destroyed_records_count: 0,
        invalid_rows_count: 0,
        marked_ids_count: 1,
        passed_nil_record_count: 0,
        unchanged_rows_count: 0,
        updated_rows_count: 0,
        has_processed_unmarked_records: true,
        validation_failure_counts_by_field: {},
      })
      expect(EventNote.all.size).to eq 1
      expect(EventNote.first.educator_id).to eq pals.shs_fatima_science_teacher.id
    end
  end
end
