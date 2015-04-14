require 'fixtures/fake_x2'
require 'rails_helper'

RSpec.describe X2Importer do

  let(:healey) { FactoryGirl.create(:healey) }
  let(:healey_importer) { X2Importer.new(healey, "05") }

  describe '#import' do
  end 

  describe '#create_or_update_student' do
    context 'student already exists in db' do
      let!(:student) { FactoryGirl.create(:student_we_want_to_update) } 
      it 'updates the student' do
        expect {
          healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_HASH)
        }.to change(Student, :count).by(0)
      end
      # it 'updates the student home langauge correctly' do
      #   healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_HASH)
      #   expect student.home_langauge.to eq "Chinese"
      # end
    end
    context 'student does not already exist in db' do
      it 'creates a new student' do
        expect {
          healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_HASH)
        }.to change(Student, :count).by(1)
      end
      # it 'sets the student home langauge correctly' do
      #   healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_HASH)
      #   expect Student.last.home_langauge.to eq "Chinese"
      # end
    end
  end

  describe '#create_or_update_homeroom' do
  end

end