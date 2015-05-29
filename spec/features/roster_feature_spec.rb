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
      let!(:educator) { FactoryGirl.create(:educator_with_homeroom_with_student) }
      it 'shows roster with one student row' do
        expect(student_rows.size).to eq 1
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
