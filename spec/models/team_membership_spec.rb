require 'rails_helper'

RSpec.describe TeamMembership, type: :model do
  describe '#active' do
    it 'works' do
      pals = TestPals.create!(skip_team_memberships: true)
      TeamMembership.create!({
        student_id: pals.shs_senior_kylo.id,
        activity_text: 'Baseball',
        school_year_text: '2017-18',
        season_key: 'fall',
        coach_text: 'Obi Wan'
      })
      expect(TeamMembership.all.size).to eq 1
      expect(TeamMembership.first.active(time_now: Time.parse('2017-10-01'))).to eq true
      expect(TeamMembership.first.active(time_now: Time.parse('2017-12-05'))).to eq false
      expect(TeamMembership.first.active(time_now: Time.parse('2018-04-01'))).to eq false
      expect(TeamMembership.first.active(time_now: Time.parse('2018-09-23'))).to eq false
      expect(TeamMembership.first.active(time_now: Time.parse('2017-02-01'))).to eq false
    end

    it 'validates school_year_text' do
      pals = TestPals.create!(skip_team_memberships: true)
      team_membership = TeamMembership.create({
        student_id: pals.shs_senior_kylo.id,
        activity_text: 'Baseball',
        school_year_text: '2017-2018',
        season_key: 'fall',
        coach_text: 'Obi Wan'
      })
      expect(team_membership.valid?).to eq false
      expect(team_membership.errors.messages).to eq(school_year_text: ['must be format 2002-03'])
    end
  end
end
