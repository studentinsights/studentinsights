require 'rails_helper'

RSpec.describe TeamMembershipImporter do
  describe 'integration test' do
    it 'works for importing teams for Mari and Kylo' do
      pals = TestPals.create!(skip_team_memberships: true)
      time_now = pals.time_now
      file_text = IO.read("#{Rails.root}/spec/importers/team_membership_import/team_membership_fixture.csv")
      importer = TeamMembershipImporter.new(file_text)
      created_records = importer.create_from_text!

      expect(created_records.size).to eq 2
      expect(importer.send(:stats)).to eq({
        :created_records_count => 2,
        :invalid_row_columns_count => 0,
        :invalid_student_local_id_count => 0,
        :invalid_student_lodal_ids_list => []
      })
      expect(TeamMembership.all.size).to eq 2
      expect(pals.shs_freshman_mari.teams(time_now: time_now).as_json(only: [:activity_text, :coach_text])).to eq([{
        'activity_text' => 'Competitive Cheerleading Varsity',
        'coach_text' => 'Fatima Teacher'
      }])
      expect(pals.shs_senior_kylo.teams(time_now: time_now).as_json(only: [:activity_text, :coach_text])).to eq([{
        'activity_text' => 'Cross Country - Boys Varsity',
        'coach_text' => 'Jonathan Fishman'
      }])
    end
  end
end
