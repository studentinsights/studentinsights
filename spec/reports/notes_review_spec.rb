require 'rails_helper'

RSpec.describe NotesReview do
  let!(:pals) { TestPals.create! }

  def seed_notes_by!(educator, text)
    pals.shs.students.each do |student|
      4.times do
        FactoryBot.create(:event_note, {
          student: student, 
          educator: educator,
          text: text,
          recorded_at: Time.now - (40 * rand()).to_i.days
        })
      end
    end
  end

  describe '#high_school_teachers' do
    it 'works' do
      seed_notes_by!(pals.shs_bill_nye, 'HS-teacher-note-text-foo')
      log = LogHelper::FakeLog.new
      expect(NotesReview.new(log: log).high_school_teachers).to eq nil
      expect(log.output).to include('HS-teacher-note-text-foo')
    end
  end

  describe '#high_school_counselors' do
    it 'works' do
      seed_notes_by!(pals.shs_sofia_counselor, 'HS-counselor-note-text-foo')
      log = LogHelper::FakeLog.new
      expect(NotesReview.new(log: log).high_school_counselors).to eq nil
      expect(log.output).to include('HS-counselor-note-text-foo')
    end
  end

  describe '#high_school_housemasters' do
    it 'works' do
      seed_notes_by!(pals.shs_harry_housemaster, 'HS-housemaster-note-text-foo')
      log = LogHelper::FakeLog.new
      expect(NotesReview.new(log: log).high_school_housemasters).to eq nil
      expect(log.output).to include('HS-housemaster-note-text-foo')
    end
  end
end