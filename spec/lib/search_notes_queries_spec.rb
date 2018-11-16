require 'spec_helper'

RSpec.describe SearchNotesQueries do
  def enable_for_educator!(educator)
    EducatorLabel.create!(
      educator: educator,
      label_key: 'enable_searching_notes'
    )
  end

  def create_test_note(params = {})
    FactoryBot.create(:event_note, {
      student_id: pals.shs_senior_kylo.id,
      event_note_type: EventNoteType.SST,
      educator_id: pals.shs_jodi.id,
      text: 'this is about reading, he is doing great this semester!',
      is_restricted: false
    }.merge(params))
  end

  describe '#queries' do
    let!(:pals) { TestPals.create! }

    def setup!
      enable_for_educator!(pals.shs_sofia_counselor)
      create_test_note(recorded_at: Time.now - 13.days)
    end

    it 'can find notes' do
      setup!
      query = {
        text: 'read',
        grade: '12',
        house: 'Broadway',
        event_note_type_id: EventNoteType.SST.id,
      }
      event_note_cards_json, all_results_size, query_with_defaults = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 1
      expect(all_results_size).to eq 1
    end

    it 'can filter out by text' do
      setup!
      query = { text: 'nonexistent-search-text' }
      event_note_cards_json, all_results_size, query_with_defaults = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by grade' do
      setup!
      query = { grade: '9' }
      event_note_cards_json, all_results_size, query_with_defaults = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by house' do
      setup!
      query = { house: 'Elm' }
      event_note_cards_json, all_results_size, query_with_defaults = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end


    it 'can filter out by note type' do
      setup!
      query = { event_note_type_id: EventNoteType.NGE.id }
      event_note_cards_json, all_results_size, query_with_defaults = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by time' do
      setup!
      query = { house: 'Elm' }
      event_note_cards_json, all_results_size, query_with_defaults = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end
  end
end
