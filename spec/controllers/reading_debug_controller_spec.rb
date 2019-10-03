require 'rails_helper'

describe ReadingDebugController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#reading_debug_json' do
    it 'guards access' do
      (Educator.all - [pals.uri]).each do |educator|
        sign_in(educator)
        get :reading_debug_json, params: { format: :json }
        expect(response.status).to eq 403
      end
    end

    it 'returns correct shape' do
      sign_in(pals.uri)
      get :reading_debug_json, params: { format: :json }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to contain_exactly(*[
        'students',
        'groups',
        'student_counts_by_grade'
      ])
      expect(json['students'].size).to eq 5
      expect(json['students'].first.keys).to contain_exactly(*[
        'id',
        'first_name',
        'last_name',
        'grade'
      ])
      expect(json['student_counts_by_grade']).to eq({
        'KF' => 1,
        '8' => 1,
        '9' => 2,
        '12' => 1
      })
    end
  end
end
