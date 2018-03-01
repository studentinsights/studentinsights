require 'rails_helper'

RSpec.describe ResearchMattersExporter do
  before { School.seed_somerville_schools }
  let!(:school) { School.find_by_name('Arthur D Healey') }
  let!(:educator) { FactoryGirl.create(:educator, :admin, school: school, full_name: 'Khamar, Matsay', email: 'matsay@demo.studentinsights.org') }
  let!(:homeroom) { Homeroom.create(name: 'HEA 300', grade: '3', school: school, educator: educator) }
  let!(:student) { FactoryGirl.create(:student, homeroom: homeroom, school: school) }

  describe '#student_file' do
    context 'no notes' do
      it 'outputs the right file' do
        exporter = ResearchMattersExporter.new

        expect(exporter.student_file).to eq([
          "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count",
          "#{student.id},HEA,0,0,0,0,0,0,#{educator.id},1"
        ])
      end
    end

    context 'notes during the focal period' do
      let!(:event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 22), event_note_type_id: 300)
      }
      let!(:another_event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 20), event_note_type_id: 300)
      }

      it 'outputs the right file' do
        exporter = ResearchMattersExporter.new

        expect(exporter.student_file).to eq([
          "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count",
          "#{student.id},HEA,0,0,0,2,0,2,#{educator.id},1"
        ])
      end
    end

    context 'notes outside the focal period' do
      let!(:event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 22), event_note_type_id: 300)
      }
      let!(:another_event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 20), event_note_type_id: 300)
      }
      let!(:outside_event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2016, 12, 20), event_note_type_id: 300)
      }

      it 'outputs the right file, does not count the notes outside the focal period' do
        exporter = ResearchMattersExporter.new

        expect(exporter.student_file).to eq([
          "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count",
          "#{student.id},HEA,0,0,0,2,0,2,#{educator.id},1"
        ])
      end
    end

    context 'notes and revision during the focal period' do
      let!(:event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 18), event_note_type_id: 300)
      }
      let!(:another_event_note) {
        FactoryGirl.create(:event_note, student: student, recorded_at: DateTime.new(2017, 12, 20), event_note_type_id: 300)
      }
      let!(:event_note_revision) {
        FactoryGirl.create(:event_note_revision, event_note: event_note, student_id: student.id, created_at: DateTime.new(2017, 12, 21), event_note_type_id: 300)
      }

      it 'outputs the right file' do
        exporter = ResearchMattersExporter.new

        expect(exporter.student_file).to eq([
          "student_id,school_id,absence_indicator,discipline_indicator,sst_indicator,notes_added,notes_revised,notes_total,educator_id,educator_count",
          "#{student.id},HEA,0,0,0,2,1,3,#{educator.id},1"
        ])
      end
    end
  end

  describe '#teacher_file' do
    it 'outputs the right file' do
      exporter = ResearchMattersExporter.new

      expect(exporter.teacher_file).to eq([
        "educator_id,email,first_name,last_name,school_id",
        "#{educator.id},matsay@demo.studentinsights.org,Matsay,Khamar,HEA"
      ])
    end
  end
end
