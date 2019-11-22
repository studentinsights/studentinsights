require 'rails_helper'

RSpec.describe BedfordDavisTransitionNotesImporter do
  def fixture_file_text
    IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_transition_notes_fixture.csv")
  end

  def fixture_tabs
    [GoogleSheetsFetcher::Tab.new({
      spreadsheet_id: 'test-spreadsheet-id',
      spreadsheet_name: 'Test Sheet Name',
      spreadsheet_url: 'https://example.com/foo',
      tab_id: '123456',
      tab_name: 'vivian',
      tab_csv: fixture_file_text
    })]
  end

  def create_mock_fetcher(test_folder_id)
    mock_fetcher = GoogleSheetsFetcher.new
    allow(GoogleSheetsFetcher).to receive(:new).and_return(mock_fetcher)
    allow(mock_fetcher).to receive(:get_tabs_from_folder).with(test_folder_id).and_return(fixture_tabs)
    mock_fetcher
  end

  def create_importer(test_folder_id, options = {})
    log = LogHelper::FakeLog.new
    fetcher = create_mock_fetcher(test_folder_id)
    importer = BedfordDavisTransitionNotesImporter.new(options: {
      folder_id: test_folder_id,
      log: log,
      fetcher: fetcher,
    }.merge(options))

    importer
  end

  describe 'integration test' do
    let!(:pals) { TestPals.create! }

    it 'works on happy path, with folder_id passed, and fetcher mocked' do
      allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))

      test_folder_id = 'foo_test_folder_id'
      importer = create_importer(test_folder_id)
      importer.import

      expect(importer.stats).to eq({
        :matcher => {
          :valid_rows_count => 1,
          :invalid_rows_count => 0,
          :invalid_course_numbers => [],
          :invalid_educator_emails_size => 0,
          :invalid_educator_last_names_size => 0,
          :invalid_educator_logins_size => 0,
          :invalid_sep_oids => [],
          :invalid_student_local_ids_size => 0
        },
        :syncer=>{
          :total_sync_calls_count=>1,
          :passed_nil_record_count=>0,
          :invalid_rows_count=>0,
          :validation_failure_counts_by_field=>{},
          :updated_rows_count=>0,
          :destroyed_records_count=>1,
          :created_rows_count=>1,
          :unchanged_rows_count=>0,
          :has_processed_unmarked_records=>true,
          :marked_ids_count=>1
        }
      })

      imported_forms = ImportedForm.where(form_key: ImportedForm::BEDFORD_DAVIS_TRANSITION_NOTES_FORM)
      expect(imported_forms.size).to eq 1
      expect(imported_forms.as_json(except: [:id, :created_at, :updated_at])).to contain_exactly(*[{
        "student_id"=>pals.healey_kindergarten_student.id,
        "form_timestamp"=>anything(),
        "form_key"=>"bedford_davis_transition_notes_form",
        "form_url"=>"https://example.com/foo#gid=123456",
        "form_json"=>{
          "LLI"=>"yes",
          "Reading Intervention (w/ specialist)"=>nil,
          "Math Intervention (w/ consult from SD)"=>"yes",
          "Please share any specific information you want the teacher to know beyond the report card. This could include notes on interventions, strategies, academic updates that aren't documented in an IEP or 504. If information is in a file please be sure to link it here or share w/ Jess via google doc folder or paper copy"=>
           "Nov- Dec: 3x30 1:4 pull out Reading group (PA and fundations)",
          "Is there any key information that you wish you knew about this student in September?"=>nil,
          "Please share anything that helped you connect with this student that might be helpful to the next teacher."=>nil
        },
        "educator_id"=>pals.healey_vivian_teacher.id
      }])
    end
  end
end
