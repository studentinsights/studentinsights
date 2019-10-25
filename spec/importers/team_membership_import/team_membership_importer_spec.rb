require 'rails_helper'

RSpec.describe TeamMembershipImporter do
  def fixture_tabs
    [GoogleSheetsFetcher::Tab.new({
      spreadsheet_id: 'test-spreadsheet-id',
      spreadsheet_name: 'Test Sheet Name',
      spreadsheet_url: 'https://example.com/foo',
      tab_id: '123456',
      tab_name: 'fall',
      tab_csv: IO.read("#{Rails.root}/spec/importers/team_membership_import/team_membership_fixture.csv")
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
    importer = TeamMembershipImporter.new(options: {
      explicit_folder_id: test_folder_id,
      log: log,
      fetcher: fetcher,
    }.merge(options))

    [importer, log]
  end

  describe 'integration test' do
    it 'works for importing teams for Mari and Kylo' do
      pals = TestPals.create!(skip_team_memberships: true)
      time_now = pals.time_now
      importer, log = create_importer('sports-folder-id')
      importer.import

      expect(importer.stats[:syncer][:total_sync_calls_count]).to eq(2)
      expect(importer.stats[:syncer][:created_rows_count]).to eq(2)
      expect(importer.stats[:syncer][:marked_ids_count]).to eq(2)
      expect(TeamMembership.all.size).to eq 2
      expect(pals.shs_freshman_mari.teams(time_now: time_now).as_json(except: [:id, :created_at, :updated_at])).to eq([{
        'student_id' => pals.shs_freshman_mari.id,
        'activity_text' => 'Competitive Cheerleading Varsity',
        'coach_text' => 'Fatima Teacher',
        'school_year_text' => '2017-18',
        'season_key' => 'fall'
      }])
      expect(pals.shs_senior_kylo.teams(time_now: time_now).as_json(except: [:id, :created_at, :updated_at])).to eq([{
        'student_id' => pals.shs_senior_kylo.id,
        'activity_text' => 'Cross Country - Boys Varsity',
        'coach_text' => 'Jonathan Fishman',
        'school_year_text' => '2017-18',
        'season_key' => 'fall'
      }])
    end
  end
end
