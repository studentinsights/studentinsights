require 'rails_helper'

describe TieringController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#show_json' do
    def get_show_json(educator, params = {})
      sign_in(educator)
      get :show_json, params: {
        format: :json,
        school_id: pals.shs.id,
        time_now: Time.now.to_i
      }
      response
    end

    it 'guard access' do
      (Educator.all - [pals.uri]).each do |educator|
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
        expect(json.keys).to eq ['students_with_tiering']
        expect(json['students_with_tiering'].size).to eq 2
        expect(json['students_with_tiering'].map(&:keys).flatten.uniq).to eq([
          "id",
          "grade",
          "first_name",
          "last_name",
          "program_assigned",
          "sped_placement",
          "house",
          "student_section_assignments",
          "tier",
          "notes"
        ])
        expect(json['students_with_tiering'].map {|s| s['notes'].keys }.flatten.uniq).to eq([
          "last_sst_note",
          "last_experience_note",
          "last_other_note"
        ])

        # amir
        expect(json['students_with_tiering'].first['tier']).to eq({
          "level"=>0,
          "triggers"=>[],
          "data"=>{
            "course_failures"=>0,
            "course_ds"=>0,
            "recent_absence_rate"=>1.0,
            "recent_discipline_actions"=>0
          }
        })

        # mari
        expect(json['students_with_tiering'][1]['tier']).to eq({
          "level"=>0,
          "triggers"=>[],
          "data"=>{
            "course_failures"=>0,
            "course_ds"=>1,
            "recent_absence_rate"=>1.0,
            "recent_discipline_actions"=>0
          }
        })
      end
    end
  end
end
