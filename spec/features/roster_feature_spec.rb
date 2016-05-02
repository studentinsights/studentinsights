require 'rails_helper'
require 'capybara/rspec'

describe 'roster', :type => :feature do
  context 'educator with account views roster' do

    def update_students_and_run_scenario
      Student.all.each do |student|
        homeroom.students << student
        student.update_recent_student_assessments
        student.update_risk_level
      end

      mock_ldap_authorization
      educator_sign_in(educator)
    end

    let(:student_rows) { all('.student-row') }

    context 'no students in homeroom' do
      let(:school) { FactoryGirl.create(:school) }
      let(:homeroom) { FactoryGirl.create(:homeroom, school: school) }
      let(:educator) { FactoryGirl.create(:educator, homeroom: homeroom, school: school) }

      before do
        mock_ldap_authorization
        educator_sign_in(educator)
      end

      it 'shows empty roster' do
        expect(student_rows.size).to eq 0
      end
    end

    context 'one student in homeroom' do
      let(:school) { FactoryGirl.create(:school) }
      let!(:homeroom) { FactoryGirl.create(:homeroom, school: school) }
      let(:educator) { FactoryGirl.create(:educator, homeroom: homeroom, school: school) }

      context 'no student assessments' do
        let!(:student) { FactoryGirl.create(:student) }

        it 'shows roster with one student row' do
          update_students_and_run_scenario
          expect(student_rows.size).to eq 1
        end
      end

      context 'one student assessment' do
        context 'MCAS' do
          let!(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment,
                                                :with_risk_level,
                                                :registered_last_year) }

          it 'shows the student assessment' do
            update_students_and_run_scenario
            mcas_math_performance = page.find('td.mcas_math.performance_level')
            expect(mcas_math_performance).to have_content 'W'
          end
        end
      end

      context 'multiple student assessments' do
        context 'STAR' do
          let!(:student) { FactoryGirl.create(:student_with_star_math_student_assessments_different_days,
                                                :with_risk_level,
                                                :registered_last_year) }

          it 'shows only the most recent STAR result in the roster' do
            update_students_and_run_scenario
            star_math_percentile_rank = page.find('td.star_math.percentile_rank')
            expect(star_math_percentile_rank).to have_content '10'
          end
        end
      end

    end

    context 'three students in homeroom' do
      let(:school) { FactoryGirl.create(:school) }
      let(:homeroom) { FactoryGirl.create(:homeroom, school: school) }
      let(:educator) { FactoryGirl.create(:educator, homeroom: homeroom, school: school) }
      before { 3.times { FactoryGirl.create(:student) } }

      it 'shows roster with three student rows' do
        update_students_and_run_scenario
        expect(student_rows.size).to eq 3
      end
    end

  end
end
