require 'rails_helper'

describe ConnectionsController, :type => :controller do
  before { request.env['HTTPS'] = 'on' }
  let!(:pals) { TestPals.create! }
  let!(:time_now) { pals.time_now }

  describe '#show_json' do
    def get_show_json(educator, params = {})
      sign_in(educator)
      get :show_json, params: {
        format: :json,
        school_id: pals.shs.id,
        time_now: pals.time_now.to_i
      }
      sign_out(educator)
      response
    end

    it 'allows everyone access, but only to authorized students in that school' do
      Student.all.each do |student|
        FactoryBot.create(:student_voice_completed2020_survey, student: student)
      end
      (Educator.all - [pals.uri]).each do |educator|
        authorized_students = Authorizer.new(educator).authorized { Student.active.to_a }
        response = get_show_json(educator)
        expect(response.status).to eq 200

        json = JSON.parse(response.body)
        expect(json['students_with_2020_survey_data'].size).to be <= authorized_students.size
        expect(authorized_students.map(&:id)).to include(*json['students_with_2020_survey_data'].map {|s| s['id'] })
      end
    end

    context 'for educator with access' do
      it 'works on happy path' do
        Student.all.each do |student|
          FactoryBot.create(:student_voice_completed2020_survey, student: student)
        end
        response = get_show_json(pals.uri)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)

        # check shape of data
        expect(json.keys).to eq ['students_with_2020_survey_data']
        expect(json['students_with_2020_survey_data'].size).to eq 3
        expect(json['students_with_2020_survey_data'].map(&:keys).flatten.uniq).to contain_exactly(*[
          "id",
          "grade",
          "first_name",
          "last_name",
          "limited_english_proficiency",
          "program_assigned",
          "sped_placement",
          "house",
          "counselor",
          "student_section_assignments_right_now",
          "notes",
          "absences_count_in_period",
          "discipline_incident_count_in_period",
          "section_assignments_right_now",
          "survey_response"
        ])
        expect(json['students_with_2020_survey_data'].map {|s| s['notes'].keys }.flatten.uniq).to eq([
          "last_sst_note",
          "last_experience_note",
          "last_counselor_note",
          "last_other_note"
        ])
      end
    end
  end
end
