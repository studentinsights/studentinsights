require 'rails_helper'

RSpec.describe StudentSectionGradesImporter do

  let(:student_section_grades_importer) {
    described_class.new(options: {
      school_scope: nil, log: LogHelper::Redirect.instance.file
    })
  }

  describe '#import_row' do
    let(:log) { LogHelper::Redirect.instance.file }
    let!(:school) { FactoryBot.create(:shs) }
    let!(:course) { FactoryBot.create(:course, school:school)}
    let!(:section) { FactoryBot.create(:section, course:course) }
    let!(:student) { FactoryBot.create(:student) }
    let!(:ssa) do
      FactoryBot.create(:student_section_assignment,
                         student: student,
                         section: section)
    end

    context 'happy path' do
      let(:row) do
        { section_number: section.section_number,
          student_local_id: student.local_id,
          school_local_id: 'SHS',
          course_number: section.course_number,
          term_local_id: 'FY',
          grade: '85.0 B+' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'creates adds grade to student section assignment' do
        ssa.reload
        expect(ssa.grade_numeric).to eq(85)
        expect(ssa.grade_letter).to eq("B+")
      end
    end

    context 'blank grade' do
      let(:row) do
        { section_number: section.section_number,
          student_local_id: student.local_id,
          school_local_id: 'SHS',
          course_number: section.course_number,
          term_local_id: 'FY',
          grade: '' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'adds grade to student section assignment' do
        ssa.reload
        expect(ssa.grade_numeric).to eq(nil)
        expect(ssa.grade_letter).to eq(nil)
      end
    end

    context 'nonsense grade' do
      let(:row) do
        { section_number: section.section_number,
          student_local_id: student.local_id,
          school_local_id: 'SHS',
          course_number: section.course_number,
          term_local_id: 'FY',
          grade: 'NONSENSE' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'does not add grade to student section assignment' do
        ssa.reload
        expect(ssa.grade_numeric).to eq(nil)
        expect(ssa.grade_letter).to eq(nil)
      end
    end

    context 'student lasid is missing' do
      let(:row) do
        { course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: section.section_number,
          term_local_id: 'FY' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'section is missing' do
      let(:row) do
        { local_id: student.local_id,
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          term_local_id: 'FY' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'student does not exist' do
      let(:row) do
        { local_id: 'NO EXIST',
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: section.section_number,
          term_local_id: 'FY' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end

    context 'section does not exist' do
      let(:row) do
        { local_id: student.local_id,
          course_number: section.course.course_number,
          school_local_id: 'SHS',
          section_number: 'NO EXIST',
          term_local_id: 'FY' }
      end

      before do
        student_section_grades_importer.import_row(row)
      end

      it 'does not create another student section assignment' do
        expect(StudentSectionAssignment.count).to eq(1)
      end
    end
  end
end
