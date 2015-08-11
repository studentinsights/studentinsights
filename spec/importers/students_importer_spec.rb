require 'rails_helper'

RSpec.describe StudentsImporter do
  let(:importer) { StudentsImporter.new }

  describe '#import_row' do
    context 'good data' do
      let(:file) { File.open("#{Rails.root}/spec/fixtures/fake_students_export.txt") }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      it 'imports two students' do
        expect { importer.import(csv) }.to change { Student.count }.by 2
      end
      it "imports first student's data correctly" do
        importer.import(csv)
        first_student = Student.find_by_state_id("1000000000")
        expect(first_student.program_assigned).to eq "Sp Ed"
        expect(first_student.limited_english_proficiency).to eq "Fluent"
        expect(first_student.student_address).to eq "155 9th St, San Francisco, CA"
        expect(first_student.registration_date).to eq DateTime.new(2008, 2, 20)
        expect(first_student.free_reduced_lunch).to eq "Not Eligible"
      end
      it "imports second student's data correctly" do
        importer.import(csv)
        second_student = Student.find_by_state_id("1000000001")
        expect(second_student.program_assigned).to eq "Reg Ed"
        expect(second_student.limited_english_proficiency).to eq "FLEP-Transitioning"
        expect(second_student.student_address).to eq "155 9th St, San Francisco, CA"
        expect(second_student.registration_date).to eq DateTime.new(2005, 8, 5)
        expect(second_student.free_reduced_lunch).to eq "Free Lunch"
      end
    end
    context 'bad data' do
      context 'missing state id' do
        let(:row) { { state_id: nil, full_name: 'Hoag, George', home_language: 'English', grade: '1', homeroom: '101' } }
        it 'raises an error' do
          expect{ importer.import_row(row) }.to raise_error ActiveRecord::RecordInvalid
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
