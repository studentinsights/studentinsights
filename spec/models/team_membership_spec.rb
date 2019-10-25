require 'rails_helper'

RSpec.describe TeamMembership, type: :model do
  describe 'validations' do
    it 'allows only valid season_key values' do
      pals = TestPals.create!(skip_team_memberships: true)
      record = TeamMembership.new({
        student_id: pals.shs_senior_kylo.id,
        activity_text: 'Hockey',
        school_year_text: '2017-18',
        season_key: 'fffffall',
        coach_text: 'Obi Wan'
      })
      record.save
      expect(record.valid?).to eq false
      expect(record.errors.details).to eq({
        :season_key=>[{:error=>:inclusion, :value=>"fffffall"}]
      })
    end

    it 'prevents duplicate records by activity, period, student' do
      pals = TestPals.create!(skip_team_memberships: true)
      legit = TeamMembership.create!({
        student_id: pals.shs_senior_kylo.id,
        activity_text: 'Hockey',
        school_year_text: '2017-18',
        season_key: 'winter',
        coach_text: 'Obi Wan'
      })
      legit.save
      expect(legit.valid?).to eq true

      duplicate = TeamMembership.new({
        student_id: pals.shs_senior_kylo.id,
        activity_text: 'Hockey',
        school_year_text: '2017-18',
        season_key: 'winter',
        coach_text: 'Obi Wan'
      })
      duplicate.save
      expect(duplicate.valid?).to eq false
      expect(duplicate.errors.details).to eq({
        :activity_text=>[{:error=>:taken, :value=>"Hockey"}]
      })
    end
  end

  describe '.active' do
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
      expect(TeamMembership.active(time_now: Time.parse('2017-10-01')).size).to eq 1
      expect(TeamMembership.active(time_now: Time.parse('2018-04-01')).size).to eq 0
      expect(TeamMembership.active(time_now: Time.parse('2018-09-23')).size).to eq 0
      expect(TeamMembership.active(time_now: Time.parse('2017-02-01')).size).to eq 0
    end
  end

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

  describe '#season_sort_key' do
    it 'works' do
      pals = TestPals.create!(skip_team_memberships: true)
      teams = [
        TeamMembership.create!({
          student_id: pals.shs_senior_kylo.id,
          activity_text: 'Hockey',
          school_year_text: '2017-18',
          season_key: 'winter',
          coach_text: 'Obi Wan'
        }),
        TeamMembership.create!({
          student_id: pals.shs_senior_kylo.id,
          activity_text: 'Soccer',
          school_year_text: '2018-19',
          season_key: 'fall',
          coach_text: 'Obi Wan'
        }),
        TeamMembership.create!({
          student_id: pals.shs_senior_kylo.id,
          activity_text: 'Baseball',
          school_year_text: '2017-18',
          season_key: 'spring',
          coach_text: 'Obi Wan'
        })
      ]
      expect(teams.sort_by(&:season_sort_key).map(&:activity_text)).to eq([
        'Hockey',
        'Baseball',
        'Soccer'
      ])
    end
  end
end
