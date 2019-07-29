require 'rails_helper'

RSpec.describe BedfordDavisServicesImporter do
  let!(:pals) { TestPals.create! }

  def create_mock_fetcher_from_map(folder_id_to_tab_map)
    mock_fetcher = GoogleSheetsFetcher.new
    allow(GoogleSheetsFetcher).to receive(:new).and_return(mock_fetcher)
    folder_id_to_tab_map.each do |folder_id, tab|
      allow(mock_fetcher).to receive(:get_tabs_from_folder).with(folder_id).and_return(tab)
    end
    mock_fetcher
  end

  def create_mock_fetcher
    create_mock_fetcher_from_map({
      'mock_folder_id_A' => GoogleSheetsFetcher::Tab.new({
        spreadsheet_id: 'test-social-emotional-sheet-id',
        spreadsheet_name: 'Test Social Emotional Sheet',
        spreadsheet_url: 'https://example.com/se',
        tab_id: '123456',
        tab_name: 'vivian',
        tab_csv: IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_social_emotional_fixture.csv")
      }),
      'mock_folder_id_B' => GoogleSheetsFetcher::Tab.new({
        spreadsheet_id: 'test-transition-sheet-id',
        spreadsheet_name: 'Test Transition notes Sheet',
        spreadsheet_url: 'https://example.com/transition',
        tab_id: '987765',
        tab_name: 'vivian',
        tab_csv: IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_transition_notes_fixture.csv")
      })
    })
  end

  def create_importer_with_fetcher_mocked(options = {})
    log = LogHelper::FakeLog.new
    fetcher = create_mock_fetcher()
    importer = BedfordDavisServicesImporter.new(options: {
      log: log,
      fetcher: fetcher,
      time_now: pals.time_now
    }.merge(options))

    importer
  end

  it 'import raises' do
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
    folder_ids = ['mock_folder_id_A', 'mock_folder_id_B']
    importer = create_importer_with_fetcher_mocked(folder_ids: folder_ids)
    expect { importer.import }.to raise_error RuntimeError
  end

  it 'works on happy path, with folder_id passed, and fetcher mocked' do
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))

    folder_ids = ['mock_folder_id_A', 'mock_folder_id_B']
    importer = create_importer_with_fetcher_mocked(folder_ids: folder_ids)
    rows = importer.dry_run

    services = Service.create!(rows)
    expect(services.size).to eq(4)
    expect(services.as_json(except: [:id, :created_at, :updated_at])).to eq([{
      "student_id"=>pals.shs_senior_kylo.id,
      "service_type_id"=>702,
      'recorded_by_educator_id' => pals.healey_vivian_teacher.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.healey_vivian_teacher.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    },{
      "student_id"=>pals.shs_freshman_amir.id,
      "service_type_id"=>704,
      'recorded_by_educator_id' => pals.healey_vivian_teacher.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.healey_vivian_teacher.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    }, {
      'student_id' => pals.healey_kindergarten_student.id,
      'service_type_id'=>706,
      'recorded_by_educator_id' => pals.healey_vivian_teacher.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.healey_vivian_teacher.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    },{
      'student_id' => pals.healey_kindergarten_student.id,
      'service_type_id'=>707,
      'recorded_by_educator_id' => pals.healey_vivian_teacher.id,
      "recorded_at"=>'2018-03-13 11:03:00.000000000 +0000',
      "date_started"=>'2017-08-15 00:00:00.000000000 +0000',
      "estimated_end_date"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_at"=>'2018-06-30 00:00:00.000000000 +0000',
      "discontinued_by_educator_id"=>pals.healey_vivian_teacher.id,
      "provided_by_educator_name"=>nil,
      "service_upload_id"=>nil
    }])
  end
end
