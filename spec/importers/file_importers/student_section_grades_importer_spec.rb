require 'rails_helper'

RSpec.describe StudentSectionGradesImporter do

  describe '#import_row' do
    let(:log) { LogHelper::Redirect.instance.file }
    let!(:school) { FactoryGirl.create(:shs) }
    let!(:section) { FactoryGirl.create(:section) }
    let!(:student) { FactoryGirl.create(:student) }
    let!(:ssa) { FactoryGirl.create(:student_section_assignment,
                                    student: student,
                                    section: section)}

    context 'happy path' do
      let(:row) { { section_number:section.section_number,
                    student_local_id:student.local_id, 
                    school_local_id: 'SHS',
                    course_number:section.course_number, 
                    term_local_id:'FY',
                    grade: '85'
                } }

      before do
        described_class.new.import_row(row)
      end

      it 'creates adds grade to student section assignment' do
        ssa.reload
        expect(ssa.grade).to eq(85)
      end
    end
    
    context 'blank grade' do
      let(:row) { { section_number:section.section_number,
                  student_local_id:student.local_id, 
                  school_local_id: 'SHS',
                  course_number:section.course_number, 
                  term_local_id:'FY',
                  grade: ''
              } }

      before do
        described_class.new.import_row(row)
      end

      it 'creates adds grade to student section assignment' do
        ssa.reload
        expect(ssa.grade).to eq(nil)
      end
    end

    context 'student lasid is missing' do
      let(:row) { { course_number:section.course.course_number, 
                  school_local_id: 'SHS',
                  section_number:section.section_number, 
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'section is missing' do
      let(:row) { { local_id:student.local_id, 
                  course_number:section.course.course_number, 
                  school_local_id: 'SHS',
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'student does not exist' do
      let(:row) { { local_id:'NO EXIST', 
                  course_number:section.course.course_number, 
                  school_local_id: 'SHS',
                  section_number:section.section_number, 
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'section does not exist' do
    let(:row) { { local_id:student.local_id, 
                  course_number:section.course.course_number, 
                  school_local_id: 'SHS',
                  section_number:'NO EXIST', 
                  term_local_id:'FY'
              } }

      before do
        importer = described_class.new(nil, nil, log, nil)
        importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end
  end
end