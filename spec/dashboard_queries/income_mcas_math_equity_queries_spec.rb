require 'rails_helper'

RSpec.describe IncomeMcasMathQueries do

  let(:school) { FactoryGirl.create(:healey) }
  let(:queries) { described_class.new(school) }

  describe '#percent_low_income_with_warning' do
    before { student.update_recent_student_assessments }
    let(:result) { queries.percent_low_income_with_warning }

    context 'no low income students with mcas math' do
      let!(:student) { FactoryGirl.create(:student, :low_income, school: school) }
      it 'returns nil' do
        expect(result).to eq nil
      end
    end

    context 'no low income students have mcas math warning' do
      let!(:student) { FactoryGirl.create(:student, :with_mcas_math_advanced_assessment, :low_income, school: school) }
      it 'returns 0.0' do
        expect(result).to eq 0.0
      end
    end

    context 'all low income students have mcas math warning' do
      let!(:student) { FactoryGirl.create(:student_with_mcas_math_warning_assessment, :low_income, school: school) }
      it 'returns 100.0' do
        expect(result).to eq 100.0
      end
    end

  end
end
