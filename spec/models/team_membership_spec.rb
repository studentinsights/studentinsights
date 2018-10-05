require 'rails_helper'

RSpec.describe TeamMembership, type: :model do
  let!(:pals) { TestPals.create! }

  describe '.active' do
    it 'works' do
      TeamMembership.create!({
        student_id: pals.shs_senior_kylo.id,
        activity_text: 'Basebase',
        school_year_text: '2017-2018',
        coach_text: 'Obi Wan'
      })
      expect(TeamMembership.all.size).to eq 1
      expect(TeamMembership.active(time_now: Time.parse('2017-10-01')).size).to eq 1
      expect(TeamMembership.active(time_now: Time.parse('2018-04-01')).size).to eq 1
      expect(TeamMembership.active(time_now: Time.parse('2018-09-23')).size).to eq 0
      expect(TeamMembership.active(time_now: Time.parse('2017-02-01')).size).to eq 0
    end
  end
end
