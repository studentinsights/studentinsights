require 'rails_helper'

describe ReflectionController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }

  describe '#notes_patterns_json' do
    def get_notes_patterns_json(educator)
      sign_in(educator)
      get :notes_patterns_json, params: {
        format: :json
      }
      sign_out(educator)
      response
    end

    def enable_for_educator!(educator)
      EducatorLabel.create!(
        educator: educator,
        label_key: 'enable_reflection_on_notes_patterns'
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
        text: 'this is about reading.  he is doing great this semester!',
        is_restricted: false
      }.merge(params))
    end

    it 'works on happy path' do
      with_time_frozen do |time_now|
        event_note = create_test_note(recorded_at: time_now - 13.days)
        response = get_notes_patterns_json(pals.uri)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json.keys).to eq(['students', 'segments_by_student_id'])
        expect(json['students'].length).to eq(5)
        expect(json['students'].first.keys).to eq([
          'id',
          'grade',
          'first_name',
          'last_name',
          'house'
        ])
        expect(json['segments_by_student_id']).to eq({
          pals.shs_senior_kylo.id.to_s => [
            "this is about reading.",
            "he is doing great this semester!"
          ]
        })
      end
    end

    it 'does not return restricted notes, even if user has access to view' do
      with_time_frozen do |time_now|
        event_note = create_test_note({
          recorded_at: time_now - 13.days,
          is_restricted: true
        })
        response = get_notes_patterns_json(pals.uri)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['segments_by_student_id']).to eq({})
      end
    end

    it 'guards student-level authorization, using Kylo as example' do
      with_time_frozen do |time_now|
        create_test_note(recorded_at: time_now - 13.days)
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
          response = get_notes_patterns_json(educator)
          expect(response.status).to eq 200
          json = JSON.parse(response.body)
          expect(json['students'].map {|j| j['id'] }).to_not include(pals.shs_senior_kylo.id)
          expect(json['segments_by_student_id']).to eq({})
        end
      end
    end
  end
end
