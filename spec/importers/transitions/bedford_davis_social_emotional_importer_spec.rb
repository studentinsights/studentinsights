require 'rails_helper'

RSpec.describe BedfordDavisSocialEmotionalImporter do
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
      'mock_folder_id_A' => [GoogleSheetsFetcher::Tab.new({
        spreadsheet_id: 'test-social-emotional-sheet-id',
        spreadsheet_name: 'Test Social Emotional Sheet',
        spreadsheet_url: 'https://example.com/se',
        tab_id: '123456',
        tab_name: 'vivian',
        tab_csv: IO.read("#{Rails.root}/spec/importers/transitions/bedford_davis_social_emotional_fixture.csv")
      })]
    })
  end

  def create_importer_with_fetcher_mocked(options = {})
    log = LogHelper::FakeLog.new
    fetcher = create_mock_fetcher()
    importer = BedfordDavisSocialEmotionalImporter.new(options: {
      log: log,
      fetcher: fetcher,
      time_now: pals.time_now
    }.merge(options))

    [importer, log]
  end

  it 'warns about deprecation' do
    expect(Rollbar).to receive(:warn).with('deprecation-warning, DEPRECATED, see RestrictedNotesProcessor and migrate to `restricted_notes`')
    create_importer_with_fetcher_mocked(folder_id: 'mock_folder_id_A')
  end

  it 'import raises' do
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
    importer, _ = create_importer_with_fetcher_mocked(folder_id: 'mock_folder_id_A')
    expect { importer.import }.to raise_error RuntimeError
  end

  it 'works on happy path, with folder_id passed, and fetcher mocked' do
    allow(PerDistrict).to receive(:new).and_return(PerDistrict.new(district_key: PerDistrict::BEDFORD))
    counselor = FactoryBot.create(:educator, full_name: 'Brown, Natalie')

    importer, log = create_importer_with_fetcher_mocked(folder_id: 'mock_folder_id_A')
    rows = importer.dry_run

    expect(log.output).to include(':processed_rows_count=>4')
    event_notes = rows.map {|row| EventNote.create!(row) }
    expect(event_notes.size).to eq(3)
    expect(event_notes.pluck(:is_restricted).uniq).to eq([true])
    expect(event_notes.as_json({
      dangerously_include_restricted_note_text: true,
      except: [:id, :created_at, :updated_at]
    })).to contain_exactly(*[{
      "student_id"=>pals.shs_senior_kylo.id,
      "educator_id"=>counselor.id,
      "event_note_type_id"=>304,
      "text"=>"Social emotional services during 2018-2019\n- Soc.Emo. Check in w/ counselor\n\nNew to district this year, transition was a little tough but settled in now.",
      "recorded_at"=>pals.time_now,
      "is_restricted"=>true
    }, {
      "student_id"=>pals.shs_freshman_amir.id,
      "educator_id"=>counselor.id,
      "event_note_type_id"=>304,
      "text"=>"Social emotional services during 2018-2019\n- Soc. Emo. Small group",
      "recorded_at"=>pals.time_now,
      "is_restricted"=>true
    }, {
      "student_id"=>pals.west_eighth_ryan.id,
      "educator_id"=>pals.healey_vivian_teacher.id,
      "event_note_type_id"=>304,
      "text"=>"Family medical issues this year, they took on a lot to support everyone at home",
      "recorded_at"=>pals.time_now,
      "is_restricted"=>true
    }])
  end
end
