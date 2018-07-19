require 'rails_helper'

RSpec.describe Absence, type: :model do
  let!(:student) { FactoryBot.create(:student) }

  subject(:absence) {
    Absence.create!(
      occurred_at: Time.now,
      student_id: student.id
    )
  }

  it { is_expected.to belong_to :student }
  it { is_expected.to validate_presence_of :student_id }
  it { is_expected.to validate_presence_of :occurred_at }
end
