require 'rails_helper'

describe SearchNotesController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }

  describe '#query_json' do
    def get_query_json(time_now, educator, params = {})
      sign_in(educator)
      get :query_json, params: {
        format: :json,
        start_time_utc: (time_now - 45.days).to_i,
        end_time_utc: time_now.to_i,
        limit: 10
      }.merge(params)
      sign_out(educator)
      response
    end

    def enable_for_educator!(educator)
      EducatorLabel.create!(
        educator: educator,
        label_key: 'enable_searching_notes'
      )
    end

    def with_time_frozen(&block)
      time_now = pals.time_now.utc
      Timecop.freeze(time_now) do
        block.call(time_now)
      end
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

    it 'works on happy path' do
      with_time_frozen do |time_now|
        enable_for_educator!(pals.uri)
        event_note = create_test_note(recorded_at: time_now - 13.days)
        response = get_query_json(time_now, pals.uri, text: 'read')
        expect(response.status).to eq 200
        expect(JSON.parse(response.body)).to eq({
          'query' => {
            'start_time_utc'=>(time_now - 45.days).localtime.as_json, # https://stackoverflow.com/questions/25049419/rails-json-response-automatically-changes-timezeone-only-on-some-requests
            'end_time_utc'=>time_now.localtime.as_json, # https://stackoverflow.com/questions/25049419/rails-json-response-automatically-changes-timezeone-only-on-some-requests
            'text'=>'read',
            'limit'=>10,
            'grade'=>nil,
            'house'=>nil,
            'event_note_type_id'=>nil,
            'scope_key'=>'SCOPE_ALL_STUDENTS'
          },
          'meta' => {
            "returned_size"=>1,
            "all_results_size"=>1
          },
          'event_note_cards' => [{
            "type"=>"event_note_card",
            "timestamp"=>"2018-02-28T11:03:00.000Z",
            "json"=>{
              "id"=>event_note.id,
              "event_note_type_id"=>EventNoteType.SST.id,
              "text"=>"this is about reading, he is doing great this semester!",
              "recorded_at"=>"2018-02-28T11:03:00.000Z",
              "educator"=>{
                "id"=>pals.shs_jodi.id,
                "email"=>"jodi@demo.studentinsights.org",
                "full_name"=>"Teacher, Jodi"
              },
              "student"=>{
                "id"=>pals.shs_senior_kylo.id,
                "grade"=>"12",
                "first_name"=>"Kylo",
                "last_name"=>"Ren",
                "house"=>"Broadway",
                "has_photo"=>false,
                "school"=>{
                  "school_type"=>"HS",
                  "local_id"=>"SHS"
                }
              }
            }
          }]
        })
      end
    end

    it 'does not return restricted notes, even if user has access to view' do
      with_time_frozen do |time_now|
        enable_for_educator!(pals.uri)
        create_test_note({
          recorded_at: time_now - 13.days,
          is_restricted: true
        })
        response = get_query_json(time_now, pals.uri, text: 'read')
        expect(response.status).to eq 200
        expect(JSON.parse(response.body)['meta']['all_results_size']).to eq(0)
        expect(JSON.parse(response.body)['event_note_cards']).to eq([])
      end
    end

    it 'guards authorization, using Kylo as example' do
      with_time_frozen do |time_now|
        unauthorized_educators = Educator.all - [
          pals.uri,
          pals.rich_districtwide,
          pals.shs_harry_housemaster, # schoolwide
          pals.shs_sofia_counselor, # schoolwide
          pals.shs_fatima_science_teacher, # schoolwide
          pals.shs_hugo_art_teacher # in course
        ]
        unauthorized_educators.each do |educator|
          enable_for_educator!(educator)
          create_test_note(recorded_at: time_now - 13.days)
          response = get_query_json(time_now, educator, text: 'read')
          expect(response.status).to eq 200
          expect(JSON.parse(response.body)['meta']['all_results_size']).to eq(0)
          expect(JSON.parse(response.body)['event_note_cards']).to eq([])
        end
      end
    end
  end
end
