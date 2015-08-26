require 'rails_helper'
require 'capybara/rspec'

describe 'roster', :type => :feature do
  context 'educator with account views roster' do
    before(:each) do
      educator_sign_in(educator)
    end

    let(:student_rows) { all('.student-row') }

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
    end
    context 'three students in homeroom' do
      let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_three_students) }
      it 'shows roster with three student rows' do
        expect(student_rows.size).to eq 3
      end
    end
  end
end
