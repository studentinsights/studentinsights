require 'rails_helper'

RSpec.describe TeamMembershipImporter, type: :controller do
  let!(:pals) { TestPals.create! }

  describe 'integration test' do
    it 'works for importing teams for Mari and Kylo' do
      file_text = IO.read("#{Rails.root}/spec/importers/team_membership_import/team_membership_fixture.csv")
      importer = TeamMembershipImporter.new(file_text)
      created_records = importer.create_from_text!
      expect(created_records.size).to eq 2
      expect(TeamMembership.all.size).to eq 2
      expect(pals.shs_freshman_mari.teams.as_json(only: [:activity_text, :coach_text])).to eq([{
        'activity_text' => 'Competitive Cheerleading Varsity',
        'coach_text' => 'Fatima Teacher'
      }])
      expect(pals.shs_senior_kylo.teams.as_json(only: [:activity_text, :coach_text])).to eq([{
        'activity_text' => 'Cross Country - Boys Varsity',
        'coach_text' => 'Jonathan Fishman'
      }])
    end
  end
end
