require 'rails_helper'

RSpec.describe AttendanceEvent do
  describe '#assign_to_student_school_year' do
    let(:attendance_event) { FactoryGirl.build(:attendance_event) }
    it 'creates a student school year' do
      expect { attendance_event.save }.to change { StudentSchoolYear.count }.by 1
    end
    it 'assigns event to student school year' do
      attendance_event.save
      expect(attendance_event.student_school_year).to be_a StudentSchoolYear
    end
  end
end
