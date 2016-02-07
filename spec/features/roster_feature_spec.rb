require 'rails_helper'
require 'capybara/rspec'

describe 'roster', :type => :feature do
  context 'educator with account views roster' do
    let(:student_rows) { all('.student-row') }

    before do
      mock_ldap_authorization
      educator.students.first.update_recent_student_assessments if educator.students.present?
      educator.students.first.update_risk_level if educator.students.present?
      educator_sign_in(educator)
    end

    context 'no students in homeroom' do
      let!(:educator) { FactoryGirl.create(:educator_with_homeroom) }
      it 'shows empty roster' do
        expect(student_rows.size).to eq 0
      end
    end

    context 'one student in homeroom' do
      context 'no student assessments' do
        let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_student) }
        it 'shows roster with one student row' do
          expect(student_rows.size).to eq 1
        end
      end

      context 'one student assessment' do
        context 'MCAS' do
          let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_student_with_mcas_math_warning) }

          it 'shows the student assessment' do
            mcas_math_performance = page.find('td.mcas_math.performance_level')
            expect(mcas_math_performance).to have_content 'W'
          end
        end
      end

      context 'multiple student assessments' do
        context 'STAR' do
          let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_multiple_star_math_student_assessments) }

          it 'shows only the most recent STAR result in the roster' do
            star_math_percentile_rank = page.find('td.star_math.percentile_rank')
            expect(star_math_percentile_rank).to have_content '10'
          end
        end
      end

      context 'one ATP intervention' do
        let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_one_atp_intervention) }
        it 'shows the correct number of hours' do
          number_of_hours = page.find('td.interventions.number-of-hours')
          expect(number_of_hours).to have_content '10'
        end
      end

      context 'non-ATP intervention' do
        let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_one_non_atp_intervention) }
        it 'shows a dash' do
          number_of_hours = page.find('td.interventions.number-of-hours')
          expect(number_of_hours).to have_content ''
        end
      end

      context 'multiple ATP interventions, more recent one has 11 hours' do
        let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_multiple_atp_interventions) }
        it 'shows the most recent intervention' do
          number_of_hours = page.find('td.interventions.number-of-hours')
          expect(number_of_hours).to have_content '11'
        end
      end

    end

    context 'three students in homeroom' do
      let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_three_students) }
      it 'shows roster with three student rows' do
        expect(student_rows.size).to eq 3
      end
    end

  end
end
