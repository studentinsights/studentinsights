require 'rails_helper'

RSpec.describe StudentsImporter do
  let(:importer) { StudentsImporter.new }

  describe '#import_row' do
    context 'good data' do
      context 'student already exists' do
        let!(:student) { FactoryGirl.create(:student_we_want_to_update) }
        let(:row) { {state_id: '10', full_name: 'Pais, Casey', home_language: 'Chinese', grade: '1', homeroom: '701' } }
        it 'updates student attributes' do
          importer.import_row(row)
          expect(student.reload.home_language).to eq 'Chinese'
        end
      end
      context 'student does not already exist' do
        let(:row) { {state_id: '10', full_name: 'Pais, Casey', home_language: 'Chinese', grade: '1', homeroom: '701' } }
        it 'creates a new student' do
          expect { importer.import_row(row) }.to change(Student, :count).by 1
        end
        it 'sets the new student attributes correctly' do
          importer.import_row(row)
          expect(Student.last.grade).to eq '1'
        end
      end
    end
    context 'bad data' do
      context 'missing state id' do
        let(:row) { { state_id: nil, full_name: 'Hoag, George', home_language: 'English', grade: '1', homeroom: '101' } }
        it 'raises an error' do
          expect{ importer.import_row(row) }.to raise_error
        end
      end
    end
  end

  describe '#split_first_and_last_name' do
    context 'well formatted name' do
      it 'assigns the first and last name correctly' do
        name = 'Hoag, George'
        expect(importer.split_first_and_last_name(name)).to eq(
          { first_name: 'George', last_name: 'Hoag' }
        )
      end
    end
    context 'poorly formatted name' do
      it 'assigns the result to the last name' do
        name = 'Hoag'
        expect(importer.split_first_and_last_name(name)).to eq(
          { first_name: nil, last_name: 'Hoag' }
        )
      end
    end
  end

  describe '#assign_student_to_homeroom' do
    context 'student already has a homeroom' do
      let!(:student) { FactoryGirl.create(:student_with_homeroom) }
      let!(:new_homeroom) { FactoryGirl.create(:homeroom) }
      it 'assigns the student to the homeroom' do
        importer.assign_student_to_homeroom(student, new_homeroom.name)
        expect(student.homeroom_id).to eq(new_homeroom.id)
      end
    end
    context 'student does not have a homeroom' do
      let!(:student) { FactoryGirl.create(:student) }
      let!(:new_homeroom_name) { "152I" }
      it 'creates a new homeroom' do
        expect {
          importer.assign_student_to_homeroom(student, new_homeroom_name)
        }.to change(Homeroom, :count).by(1)
      end
      it 'assigns the student to the homeroom' do
        importer.assign_student_to_homeroom(student, new_homeroom_name)
        new_homeroom = Homeroom.find_by_name(new_homeroom_name)
        expect(student.homeroom_id).to eq(new_homeroom.id)
      end
    end
  end
end
