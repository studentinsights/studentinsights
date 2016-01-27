require 'rails_helper'

RSpec.describe Tardy do
  let!(:student_school_year) { FactoryGirl.create(:student_school_year) }

  subject(:tardy) { Tardy.create!(student_school_year: student_school_year, occurred_at: Time.now) }

  it { is_expected.to belong_to :student_school_year }
  it { is_expected.to validate_presence_of :student_school_year }
  it { is_expected.to validate_presence_of :occurred_at }
end
