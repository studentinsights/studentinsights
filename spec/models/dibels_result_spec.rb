require 'rails_helper'

RSpec.describe DibelsResult, type: :model do
  let(:student_id) { FactoryBot.create(:student).id }

  describe 'benchmark validation' do
    context 'has valid benchmark score' do
      it 'is valid' do
        dibels = DibelsResult.new(
          benchmark: 'INTENSIVE',
          student_id: student_id,
          date_taken: DateTime.now - 1.day,
        )

        expect(dibels).to be_valid
      end
    end
    context 'has a slightly off benchmark score' do
      it 'is invalid' do
        dibels = DibelsResult.new(
          benchmark: 'INT',
          student_id: student_id,
          date_taken: DateTime.now - 1.day,
        )

        expect(dibels).to be_invalid
        expect(dibels.errors.messages[:benchmark]).to eq ["INT is not one of: CORE, INTENSIVE, STRATEGIC"]
      end
    end
    context 'has a junk benchmark score' do
      it 'is invalid' do
        dibels = DibelsResult.new(
          benchmark: 'VALUE!#',
          student_id: student_id,
          date_taken: DateTime.now - 1.day,
        )

        expect(dibels).to be_invalid
        expect(dibels.errors.messages[:benchmark]).to eq ["VALUE!# is not one of: CORE, INTENSIVE, STRATEGIC"]
      end
    end
  end
end
