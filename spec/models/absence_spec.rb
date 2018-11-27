require 'rails_helper'

RSpec.describe Absence, type: :model do
  let!(:student) { FactoryBot.create(:student) }

  def create_absence
    Absence.create!(
      occurred_at: Time.now,
      student_id: student.id
    )
  end

  it { expect(create_absence.valid?).to eq true }
end
