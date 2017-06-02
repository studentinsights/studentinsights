require 'rails_helper'

RSpec.describe DisciplineIncident do
  let!(:student) { FactoryGirl.create(:student) }
  let!(:student_school_year) {
    student.student_school_years.first || StudentSchoolYear.create!(
      student: student, school_year: SchoolYear.first_or_create!
    )
  }

  subject(:incident) {
    DisciplineIncident.create!(
      student_school_year: student_school_year,
      occurred_at: Time.now,
      student: student
    )
  }

  it { is_expected.to belong_to :student_school_year }
  it { is_expected.to validate_presence_of :student_school_year }
  it { is_expected.to validate_presence_of :occurred_at }
end
