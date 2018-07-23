require 'rails_helper'

RSpec.describe Tardy do
  let!(:student) { FactoryBot.create(:student) }

  subject(:tardy) {
    Tardy.create!(
      occurred_at: Time.now,
      student_id: student.id
    )
  }

  it { is_expected.to belong_to :student }
  it { is_expected.to validate_presence_of :student_id }
  it { is_expected.to validate_presence_of :occurred_at }
end
