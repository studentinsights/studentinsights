require 'rails_helper'

RSpec.describe StudentsImporter do

  let(:students_importer) {
    described_class.new(options: {
      school_scope: nil, log: nil
    })
  }

  describe '#import_row' do
    context 'good data' do
      let(:file) { File.read("#{Rails.root}/spec/fixtures/fake_students_export.txt") }
      let(:transformer) { CsvTransformer.new }
      let(:csv) { transformer.transform(file) }
      let(:import) { csv.each { |row| students_importer.import_row(row) } }
      let!(:high_school) { School.create(local_id: 'SHS') }
      let!(:healey) { School.create(local_id: 'HEA') }
      let!(:brown) { School.create(local_id: 'BRN') }

      context 'no existing students in database' do

        it 'creates Student and StudentRiskLevel records' do
          expect { import }.to change { [Student.count, StudentRiskLevel.count] }.by([4, 4])
        end

        it 'does not import students with far future registration dates' do
          import
          expect(Student.count).to eq 4
          expect(Student.where(state_id: '1000000003').size).to eq 0
        end

        it 'imports student data correctly' do
          expect { import }.to change { [Student.count, StudentRiskLevel.count] }.by([4, 4])

          first_student = Student.find_by_state_id('1000000000')
          expect(first_student.reload.school).to eq healey
          expect(first_student.program_assigned).to eq 'Sp Ed'
          expect(first_student.limited_english_proficiency).to eq 'Fluent'
          expect(first_student.student_address).to eq '155 9th St, San Francisco, CA'
          expect(first_student.registration_date).to eq DateTime.new(2008, 2, 20)
          expect(first_student.free_reduced_lunch).to eq 'Not Eligible'
          expect(first_student.date_of_birth).to eq DateTime.new(1998, 7, 15)
          expect(first_student.race).to eq 'Black'
          expect(first_student.hispanic_latino).to eq false
          expect(first_student.gender).to eq 'F'
          expect(first_student.student_risk_level).to_not eq nil
          expect(first_student.house).to eq ''
          expect(first_student.counselor).to eq nil

          second_student = Student.find_by_state_id('1000000002')
          expect(second_student.race).to eq 'White'
          expect(second_student.hispanic_latino).to eq true
          expect(second_student.gender).to eq 'F'
          expect(second_student.student_risk_level).to_not eq nil

          shs_student = Student.find_by_state_id('1000000001')
          expect(shs_student.house).to eq 'Elm'
          expect(shs_student.counselor).to eq 'LABERGE'
        end

      end

      context 'when an existing student in the database' do
        before do
          student = Student.new(local_id: '100', school: healey, grade: '7')
          student.save!
          student.create_student_risk_level!
        end
        it 'does not create new records for existing students' do
          expect([Student.count, StudentRiskLevel.count]).to eq([1, 1])
          import
          expect([Student.count, StudentRiskLevel.count]).to eq([4, 4])
        end
      end

      context 'when students already imported' do
        before do
          import
        end
        it 'does not create new records for existing students' do
          expect([Student.count, StudentRiskLevel.count]).to eq([4, 4])
          import
          expect([Student.count, StudentRiskLevel.count]).to eq([4, 4])
        end
      end

      context 'student in database who has since graduated on to high school' do
        let!(:graduating_student) {
          Student.create!(local_id: '101', school: healey, grade: '8')   # Old data
        }

        it 'imports students' do
          expect { import }.to change { Student.count }.by 3
        end

        it 'updates the student\'s data correctly' do
          import

          expect(graduating_student.reload.school).to eq high_school
          expect(graduating_student.grade).to eq '10'
          expect(graduating_student.enrollment_status).to eq 'Active'
        end

      end

    end

    context 'bad data' do
      let(:row) { { state_id: nil, full_name: 'Hoag, George', home_language: 'English', grade: '1', homeroom: '101' } }
      it 'raises an error' do
        expect{
          students_importer.import_row(row)
        }.to raise_error(
          ActiveRecord::RecordInvalid
        )
      end
    end

  end

  describe '#assign_student_to_homeroom' do

    context 'student already has a homeroom' do
      let!(:school) { FactoryGirl.create(:school) }
      let!(:student) { FactoryGirl.create(:student_with_homeroom, school: school) }
      let!(:new_homeroom) { FactoryGirl.create(:homeroom, school: school) }

      it 'assigns the student to the homeroom' do
        students_importer.assign_student_to_homeroom(student, new_homeroom.name)
        expect(student.reload.homeroom).to eq(new_homeroom)
      end
    end

    context 'student does not have a homeroom' do
      let!(:student) { FactoryGirl.create(:student) }
      let!(:new_homeroom_name) { '152I' }
      it 'creates a new homeroom' do
        expect {
          students_importer.assign_student_to_homeroom(student, new_homeroom_name)
        }.to change(Homeroom, :count).by(1)
      end
      it 'assigns the student to the homeroom' do
        students_importer.assign_student_to_homeroom(student, new_homeroom_name)
        new_homeroom = Homeroom.find_by_name(new_homeroom_name)
        expect(student.homeroom_id).to eq(new_homeroom.id)
      end
    end

    context 'student is inactive' do
      let!(:student) { FactoryGirl.create(:student, enrollment_status: 'Inactive') }
      let!(:new_homeroom_name) { '152K' }

      it 'does not create a new homeroom' do
        expect {
          students_importer.assign_student_to_homeroom(student, new_homeroom_name)
        }.to change(Homeroom, :count).by(0)
      end

    end

  end
end
