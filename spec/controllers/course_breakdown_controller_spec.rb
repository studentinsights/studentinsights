require 'rails_helper'

describe CourseBreakdownController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#show_json' do
    def get_show_json(educator, params = {})
      sign_in(educator)
      get :show_json, params: {
        format: :json,
        school_id: pals.shs.id,
      }
      sign_out(educator)
      response
    end

    it 'does not allow access for users without districtwide access' do
      (Educator.all - [pals.uri, pals.rich_districtwide]).each do |educator|
        response = get_show_json(educator)
        expect(response.status).to eq 403
      end
    end

    context 'for educator with access' do
      it 'works on happy path' do
        response = get_show_json(pals.uri)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)

        # check shape of data
        expect(json.keys).to eq ['course_breakdown', 'student_proportions']
        expect(json['course_breakdown'].size).to eq 3
        expect(json['course_breakdown'].map(&:keys).flatten.uniq).to contain_exactly(*[
          "course_name",
          "course_number",
          "course_year_data",
          "is_honors",
          "section_numbers",
          "subject"
        ])
        expect(json['course_breakdown'].map {|s| s['course_year_data']['2018'].keys }.flatten.uniq).to eq([
          'total_students',
          'race_not_specified_count',
          'race_not_specified_mean_grade',
          'race_not_specified_median_grade',
          'gender_not_specified_count',
          'gender_not_specified_mean_grade',
          'gender_not_specified_median_grade'
        ])
      end
    end
  end
end
