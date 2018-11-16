require 'rails_helper'

describe SearchNotesController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }

  describe '#query_json' do
    def get_query_json(educator, params = {})
      sign_in(educator)
      get :query_json, params: {
        format: :json,
      }.merge(params)
      sign_out(educator)
      response
    end

    def with_time_frozen(&block)
      time_now = pals.time_now.utc
      Timecop.freeze(time_now) do
        block.call(time_now)
      end
    end

    it 'works on happy path' do
      with_time_frozen do |time_now|
        EducatorLabel.create!(
          educator: pals.uri,
          label_key: 'enable_searching_notes'
        )
        response = get_query_json(pals.uri, text: 'foo', garbage_param: 'no')
        expect(response.status).to eq 200
        expect(JSON.parse(response.body)).to eq({
          'query' => {
            'time_now'=>time_now.localtime.as_json, # https://stackoverflow.com/questions/25049419/rails-json-response-automatically-changes-timezeone-only-on-some-requests
            'limit'=>20,
            'grade'=>'ALL',
            'house'=>'ALL',
            'event_note_type_ids'=>'ALL',
            'student_scope_key'=>'ALL'
          },
          'notes' => []
        })
      end
    end
  end
end
