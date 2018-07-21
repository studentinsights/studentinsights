require 'spec_helper'

RSpec.describe InsightStudentsWithHighAbsences do
  let!(:pals) { TestPals.create! }
  let!(:time_now) { Time.zone.local(2018, 3, 5, 8, 45) }

  def create_absences(n, student, time_now, attrs = {})
    n.times do |index|
      Absence.create!({
        occurred_at: time_now - index.days,
        student: student
      }.merge(attrs))
    end
  end

  describe '#students_with_high_absences_json' do
    it 'finds no one for Fatima' do
      create_absences(4, pals.shs_freshman_mari, time_now)
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_fatima_science_teacher)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq []
    end

    it 'finds Mari for Bill when at threshold' do
      create_absences(4, pals.shs_freshman_mari, time_now)
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_bill_nye)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq [{
        :count=> 4,
        :student => {
          "id"=> pals.shs_freshman_mari.id,
          "grade"=>"9",
          "first_name"=>"Mari",
          "last_name"=>"Kenobi",
          "house"=>"Beacon"
        }
      }]
    end

    it 'finds no one for Bill when under threshold' do
      create_absences(3, pals.shs_freshman_mari, time_now)
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_bill_nye)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq []
    end

    it 'excludes PreK student for K8 principal' do
      prek_student = FactoryBot.create(:student, {
        grade: 'PK',
        school: pals.healey
      })
      create_absences(6, prek_student, time_now)
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.healey_laura_principal)
      students_with_high_absences = insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
      expect(students_with_high_absences).to eq []
    end
  end

  describe '#recently_commented_student_ids' do
    let!(:insight) { InsightStudentsWithHighAbsences.new(pals.shs_bill_nye) }
    let!(:time_threshold) { time_now - 45.days }
    let!(:student_ids) { [pals.shs_freshman_mari] }

    it 'with no comment' do
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end

    it 'with NGE' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: EventNoteType.NGE,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq [
        pals.shs_freshman_mari.id
      ]
    end

    it 'with SST comment' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: EventNoteType.SST,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq [
        pals.shs_freshman_mari.id
      ]
    end

    it 'always excludes restricted notes' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: EventNoteType.SST,
        is_restricted: true,
        text: 'blah',
        recorded_at: time_now
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end

    it 'respects time_threshold' do
      EventNote.create!(
        student: pals.shs_freshman_mari,
        educator: pals.uri,
        event_note_type: EventNoteType.SST,
        text: 'blah',
        recorded_at: time_now - 50.days
      )
      expect(insight.send(:recently_commented_student_ids, student_ids, time_threshold)).to eq []
    end
  end

  describe '#absence_counts_for_students' do
    def test_absence_counts_for_students(options = {})
      time_threshold = time_now - 45.days
      absences_threshold = 4
      insight = InsightStudentsWithHighAbsences.new(pals.shs_bill_nye, options)
      insight.students_with_high_absences_json(time_now, time_threshold, absences_threshold)
    end

    def expect_n_absences_for(json, n, student_id)
      expect(json.size).to eq 1
      expect(json.first[:count]).to eq n
      expect(json.first[:student]['id']).to eq student_id
    end

    it 'considers excused: nil absences by default' do
      n = rand(2..5)
      create_absences(n, pals.shs_freshman_mari, time_now, excused: nil)
      json = test_absence_counts_for_students
      expect_n_absences_for(json, n, pals.shs_freshman_mari.id)
    end

    it 'considers unexcused absences by default' do
      n = rand(2..5)
      create_absences(n, pals.shs_freshman_mari, time_now, excused: false)
      json = test_absence_counts_for_students
      expect_n_absences_for(json, n, pals.shs_freshman_mari.id)
    end

    it 'ignores excused absences by default' do
      n = rand(2..5)
      create_absences(n, pals.shs_freshman_mari, time_now, excused: true)
      expect(test_absence_counts_for_students).to eq []
    end

    it 'considers excused absences with :include_excused_absences' do
      n = rand(2..5)
      create_absences(n, pals.shs_freshman_mari, time_now, excused: true)
      json = test_absence_counts_for_students(include_excused_absences: true)
      expect_n_absences_for(json, n, pals.shs_freshman_mari.id)
    end
  end
end
