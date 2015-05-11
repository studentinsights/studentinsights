require 'fixtures/fake_x2'
require 'rails_helper'

RSpec.describe X2Importer do

  let(:healey) { FactoryGirl.create(:healey) }
  let(:healey_importer) { X2Importer.new(healey, "05") }

  describe '#import' do
    context 'importer for healey school' do
      it 'imports a healey student' do
        expect {
          healey_importer.import([FakeX2::FAKE_HEALEY_STUDENT], [FakeX2::FAKE_HEALEY_SCHOOL])
        }.to change(Student, :count).by(1)
      end
      it 'does not import a brown student' do 
        expect {
          healey_importer.import([FakeX2::FAKE_BROWN_STUDENT], [FakeX2::FAKE_BROWN_SCHOOL])
        }.to change(Student, :count).by(0)
      end
    end
  end 

  describe '#create_or_update_student' do
    context 'student already exists' do
      let!(:student) { FactoryGirl.create(:student_we_want_to_update) } 
      it 'updates the student' do
        expect {
          healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_WITH_NAME)
        }.to change(Student, :count).by(0)
      end
      it 'updates the student home langauge correctly' do
        healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_WITH_NAME)
        expect(student.reload.home_language).to eq("Chinese")
      end
    end
    context 'student does not already exist' do
      it 'creates a new student' do
        expect {
          healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_WITH_NAME)
        }.to change(Student, :count).by(1)
      end
      context 'student info contains a name field' do
        it 'updates the student name correctly' do
          new_student = healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_WITH_NAME)
          expect(new_student.reload.first_name).to eq("Amir")
          expect(new_student.reload.last_name).to eq("Hadjihabib")
        end
      end
      context 'student info does not contains a name field' do
        it 'does not raise an error' do
          expect { 
            healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_WITHOUT_NAME)
          }.to_not raise_error
        end
        it 'does not set a name' do
          new_student = healey_importer.create_or_update_student(FakeX2::FAKE_STUDENT_WITHOUT_NAME)
          expect(new_student.reload.first_name).to eq nil
          expect(new_student.reload.last_name).to eq nil
        end
      end
    end
  end

  describe '#assign_student_to_homeroom' do
    context 'student already has a homeroom' do
      let!(:student) { FactoryGirl.create(:student_with_homeroom) } 
      let!(:new_homeroom) { FactoryGirl.create(:homeroom) } 
      it 'assigns the student to the homeroom' do
        healey_importer.assign_student_to_homeroom(student, new_homeroom.name)
        expect(student.homeroom_id).to eq(new_homeroom.id)
      end
    end
    context 'student does not have a homeroom' do
      let!(:student) { FactoryGirl.create(:student) } 
      let!(:new_homeroom_name) { "152I" } 
      it 'creates a new homeroom' do
        expect {
          healey_importer.assign_student_to_homeroom(student, new_homeroom_name)
        }.to change(Homeroom, :count).by(1)
      end
      it 'assigns the student to the homeroom' do
        healey_importer.assign_student_to_homeroom(student, new_homeroom_name)
        new_homeroom = Homeroom.find_by_name(new_homeroom_name)
        expect(student.homeroom_id).to eq(new_homeroom.id)
      end
    end
  end
end