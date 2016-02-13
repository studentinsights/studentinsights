require 'rails_helper'
require 'capybara/rspec'

describe 'export profile', :type => :feature do

  context 'educator with account' do
    let!(:school) { FactoryGirl.create(:school) }
    let!(:educator) { FactoryGirl.create(:educator, :admin) }
    let(:csv) { CSV.parse(page.body) }
    let(:date) { DateTime.new(2015, 5, 1) }

    before(:each) do
      Timecop.freeze(date) do
        mock_ldap_authorization
        educator_sign_in(educator)
        visit "/students/#{student.id}"
        click_on 'Export'
      end
    end

    context 'student with no attendance events or assessment events' do
      let!(:student) {
        Timecop.freeze(date) {
          FactoryGirl.create(:student_who_registered_in_2013_2014, :with_risk_level)
        }
      }

      it 'sends a csv' do
        content_type = page.response_headers['Content-Type']
        expect(content_type).to eq 'text/csv'
      end

      it 'sets the right values' do
        csv = CSV.parse(page.body)
        expect(csv).to eq [
          [ "Demographics" ],
          [ "Program Assigned", nil ],
          [ "504 Plan", nil ],
          [ "Placement", nil ],
          [ "Disability", nil ],
          [ "Level of Need", nil ],
          [ "Language Fluency", nil ],
          [ "Home Language", nil ],
          [],
          [ "School Year", "Number of Absences" ],
          [ "2014-2015", "0" ],
          [ "2013-2014", "0" ],
          [ "School Year", "Number of Tardies" ],
          [ "2014-2015", "0" ],
          [ "2013-2014", "0" ],
          [ "School Year", "Number of Discipline Incidents" ],
          [ "2014-2015", "0" ],
          [ "2013-2014", "0" ]
        ]
      end
    end

    context 'student with absences' do
      let!(:student) {
        Timecop.freeze(date) {
          FactoryGirl.create(:student_with_absence,
                             :with_risk_level,
                             grade: '6')
        }
      }

      it 'sends the correct CSV ' do
        expect(csv).to eq [
          [ "Demographics" ],
          [ "Program Assigned", nil ],
          [ "504 Plan", nil ],
          [ "Placement", nil ],
          [ "Disability", nil ],
          [ "Level of Need", nil ],
          [ "Language Fluency", nil ],
          [ "Home Language", nil ],
          [],
          [ "School Year", "Number of Absences" ],
          [ "2015-2016", "1" ],
          [ "2014-2015", "0" ],
          [ "2008-2009", "0" ],
          [ "School Year", "Number of Tardies" ],
          [ "2015-2016", "0" ],
          [ "2014-2015", "0" ],
          [ "2008-2009", "0" ],
          [ "School Year", "Number of Discipline Incidents" ],
          [ "2015-2016", "0" ],
          [ "2014-2015", "0" ],
          [ "2008-2009", "0" ]
        ]
      end
    end

  end

  context 'someone without account' do
    let!(:student) { FactoryGirl.create(:student_who_registered_in_2013_2014, :with_risk_level) }
    it 'does not work' do
      visit "/students/#{student.id}.csv"
      expect(page).to have_content 'You need to sign in before continuing.'
    end
  end

end
