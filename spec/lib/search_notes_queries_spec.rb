# typed: false
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

  def make_query(params = {})
    {
      end_time_utc: Time.now,
      start_time_utc: Time.now - 45.days,
      limit: 50
    }.merge(params)
  end

  describe '#queries' do
    let!(:pals) { TestPals.create! }

    def setup!
      enable_for_educator!(pals.shs_sofia_counselor)
      create_test_note(recorded_at: Time.now - 13.days)
    end

    it 'can find notes' do
      setup!
      query = make_query({
        text: 'read',
        grade: '12',
        house: 'Broadway',
        event_note_type_id: EventNoteType.SST.id,
      })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 1
      expect(all_results_size).to eq 1
    end

    it 'can filter out by text' do
      setup!
      query = make_query({ text: 'nonexistent-search-text' })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by grade' do
      setup!
      query = make_query({ grade: '9' })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by house' do
      setup!
      query = make_query({ house: 'Elm' })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by note type' do
      setup!
      query = make_query({ event_note_type_id: EventNoteType.NGE.id })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'can filter out by time' do
      setup!
      query = make_query({ house: 'Elm' })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
    end

    it 'clamps start_time_utc, so notes are unqueryable past server-set threshold' do
      setup!
      create_test_note(text: 'foo', recorded_at: Time.now - 6.years)
      query = make_query(text: 'foo', start_time_utc: Time.now - 10.years)
      event_note_cards_json, all_results_size, clamped_query = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 0
      expect(all_results_size).to eq 0
      expect(clamped_query[:start_time_utc].year).to eq(Time.now.year - 4)
    end

    it 'clamps limit' do
      setup!
      103.times.each {|i| create_test_note(text: "foo #{i}", recorded_at: Time.now - i.minutes) }
      query = make_query(text: 'foo', limit: 999)
      event_note_cards_json, all_results_size, clamped_query = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(all_results_size).to eq 103
      expect(event_note_cards_json.size).to eq 100
      expect(clamped_query[:limit]).to eq 100
    end

    it 'logs queries coarsely' do
      setup!
      query = make_query({
        text: 'read',
        grade: '12',
        house: 'Broadway',
        event_note_type_id: EventNoteType.SST.id
      })
      event_note_cards_json, all_results_size, _ = SearchNotesQueries.new(pals.shs_sofia_counselor).query(query)
      expect(event_note_cards_json.size).to eq 1
      expect(all_results_size).to eq 1
      expect(LoggedSearch.all.size).to eq 1
      expect(LoggedSearch.all.as_json(except: [:id])).to eq([{
        "clamped_query_json"=>{
          "limit" => 50,
          "text" => "read",
          "grade" => "12",
          "house" => "Broadway",
          "event_note_type_id" => 300,
          "scope_key" => "SCOPE_ALL_STUDENTS"
        }.to_json,
        "all_results_size"=>1,
        "search_date"=>Date.today
      }])
    end
  end
end
