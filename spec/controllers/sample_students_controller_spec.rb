require 'rails_helper'

describe SampleStudentsController, :type => :controller do
  def get_sample_students_json(params = {})
    request.env['HTTP_ACCEPT'] = 'application/json'
    get :sample_students_json, params: params
    response
  end

  describe '#sample_students_json' do
    let!(:pals) { TestPals.create! }

    it 'works on happy path' do
      request.env['HTTPS'] = 'on'
      sign_in(pals.uri)
      response = get_sample_students_json(n: 3, seed: 42)

      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to contain_exactly('sample_students')
      expect(json['sample_students'].size).to eq 3
      expect(json['sample_students'].first.keys).to contain_exactly(*[
        'first_name',
        'grade',
        'id',
        'last_name',
        'school'
      ])
    end

    it 'guards access if not signed in' do
      request.env['HTTPS'] = 'on'
      response = get_sample_students_json
      expect(response.status).to eq 401
    end

    it 'guards access if not authorized' do
      request.env['HTTPS'] = 'on'
      sign_in(pals.rich_districtwide)
      response = get_sample_students_json
      expect(response.status).to eq 403
    end
  end
end
