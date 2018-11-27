require 'rails_helper'

RSpec.describe Tardy do
  let!(:student) { FactoryBot.create(:student) }

  def create_tardy
    Tardy.create!(
      occurred_at: Time.now,
      student_id: student.id
    )
  end

  it { expect(create_tardy.valid?).to eq true }
end
