require 'rails_helper'

describe SearchNotesController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#query_json' do
    def get_query_json(educator, params = {})
      sign_in(educator)
      get :query_json, params: {
        format: :json,
      }.merge(params)
      sign_out(educator)
      response
    end

    it 'allows everyone access, but only to authorized students in that school' do
      EducatorLabel.create!(
        educator: pals.uri,
        label_key: 'enable_searching_notes'
      )
      response = get_query_json(pals.uri, text: 'foo', garbage_param: 'no')
      expect(response.status).to eq 200
      expect(JSON.parse(response.body)).to eq({
        'query' => {
          'text' =>'foo'
        },
        'notes' => []
      })
    end
  end
end
