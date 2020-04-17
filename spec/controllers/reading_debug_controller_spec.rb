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
        'schools'
      ])
      expect(json['students'].first.keys).to contain_exactly(*[
        'id',
        'first_name',
        'last_name',
        'grade',
        'school_id'
      ])
      expect(json['students'].size).to eq Student.active.size
      expect(json['students'].map {|s| s['grade'] }.uniq).to contain_exactly(*[
        'KF',
        '8',
        '9',
        '12'
      ])
    end

    it 'respect school_id_now param and response is scoped by school' do
      sign_in(pals.uri)
      get :reading_debug_json, params: {
        format: :json,
        school_id_now: pals.west.id
      }
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to contain_exactly(*[
        'students',
        'groups',
        'schools'
      ])
      expect(json['students'].first.keys).to contain_exactly(*[
        'id',
        'first_name',
        'last_name',
        'grade',
        'school_id'
      ])
      expect(json['students'].size).to eq 1
      expect(json['students'].map {|s| s['grade'] }.uniq).to contain_exactly('8')
    end
  end
end
