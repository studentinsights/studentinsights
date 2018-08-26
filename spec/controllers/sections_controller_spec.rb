require 'rails_helper'

describe SectionsController, :type => :controller do
  describe '#my_sections_json' do
    let!(:pals) { TestPals.create! }

    def get_my_sections_json(educator)
      sign_in(educator)
      request.env['HTTPS'] = 'on'
      get :my_sections_json, params: { format: :json }
    end

    def response_json_for_get_my_sections_json(educator)
      get_my_sections_json(educator)
      expect(response.status).to eq 200
      JSON.parse(response.body)
    end

    it 'works for Fatima as a happy path test case' do
      expect(response_json_for_get_my_sections_json(pals.shs_fatima_science_teacher)).to eq({
        "sections"=>[{
          "id"=>pals.shs_third_period_physics.id,
          "section_number"=>"SCI-201A",
          "term_local_id"=>"S1",
          "schedule"=>"3(M,W,F)",
          "room_number"=>"306W",
          "course"=>{
            "id"=>pals.shs_physics_course.id,
            "course_number"=>"SCI-201",
            "course_description"=>"PHYSICS 1"
          },
          "educators"=>[{
            "id"=>pals.shs_fatima_science_teacher.id,
            "email"=>"fatima@demo.studentinsights.org",
            "full_name"=>"Teacher, Fatima"
          }]
        }, {
          "id"=>pals.shs_fifth_period_physics.id,
          "section_number"=>"SCI-201B",
          "term_local_id"=>"S1",
          "schedule"=>"5(M,W,F)",
          "room_number"=>"306W",
          "course"=>{
            "id"=>pals.shs_physics_course.id,
            "course_number"=>"SCI-201",
            "course_description"=>"PHYSICS 1"
          },
          "educators"=>[{
            "id"=>pals.shs_fatima_science_teacher.id,
            "email"=>"fatima@demo.studentinsights.org",
            "full_name"=>"Teacher, Fatima"
          }]
        }]
      })
    end

    it 'returns nothing for districtwide admin' do
      expect(response_json_for_get_my_sections_json(pals.uri)).to eq({
        "sections"=>[]
      })
    end
  end

  describe '#section_json' do
    def make_request(id = nil)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :section_json, params: { id: id }
    end

    def extract_serialized_ids(response, field)
      json = JSON.parse(response.body)
      json[field.to_s].map {|data_hash| data_hash['id'] }
    end

    context 'can be disabled by PerDistrict' do
      let!(:pals) { TestPals.create! }
      let!(:educator) { pals.shs_bill_nye }
      let!(:section) { pals.shs_tuesday_biology_section }
      before { sign_in(educator) }
      before do
        mock_per_district = instance_double(PerDistrict)
        expect(mock_per_district).to receive(:high_school_enabled?).and_return(false)
        expect(PerDistrict).to receive(:new).and_return(mock_per_district)
      end

      it 'guards access' do
        make_request(section.id)
        expect(response.status).to eq 403
      end
    end

    context 'with test pals setup' do
      let!(:pals) { TestPals.create! }
      context 'happy path' do
        let!(:educator) { pals.shs_bill_nye }
        let!(:section) { pals.shs_tuesday_biology_section }
        before { sign_in(educator) }

        it 'returns the right shape of data' do
          make_request(section.id)
          json = JSON.parse(response.body)
          expect(json['sections'].size).to eq 2
          expect(json['students'].size).to eq 1
          expect(json['students'].first.keys).to include(
            'event_notes_without_restricted',
            'most_recent_school_year_absences_count',
            'most_recent_school_year_tardies_count',
            'most_recent_school_year_discipline_incidents_count'
          )
        end

        it 'does not include restricted notes' do
          EventNote.create!({
            educator: pals.uri,
            student: pals.shs_freshman_mari,
            text: 'something sensitive',
            is_restricted: true,
            event_note_type_id: 300,
            recorded_at: Time.now
          })
          make_request(section.id)
          json = JSON.parse(response.body)
          expect(json['students'].first['event_notes_without_restricted']).to eq []
        end
      end
    end

    context 'with misassigned sections' do
      let!(:pals) { TestPals.create! }
      let!(:high_school) { pals.shs }
      let!(:high_school_educator) { FactoryBot.create(:educator, school: high_school) }
      let!(:k8_school) { pals.healey }
      let!(:course) { FactoryBot.create(:course, school: high_school) }
      let!(:first_section) { FactoryBot.create(:section, course: course) }
      let!(:first_student) { FactoryBot.create(:student, :registered_last_year, grade: '3', school: k8_school) }
      let!(:ssa1) { FactoryBot.create(:student_section_assignment, student: first_student, section: first_section)}
      let!(:first_esa) { FactoryBot.create(:educator_section_assignment, educator: high_school_educator, section: first_section)}

      describe '#section_json' do
        it 'does student-level authorization, beyond just section relation' do
          sign_in(high_school_educator)
          make_request(first_section.id)
          expect(response.status).to eq 200
          expect(extract_serialized_ids(response, :students)).to eq []
          expect(extract_serialized_ids(response, :sections)).to eq [first_section.id]
        end

        it 'does not allow educators not at a HS' do
          sign_in(pals.healey_laura_principal)
          make_request(first_section.id)
          expect(response.status).to eq 403
        end
      end
    end

    context 'with controller-specific test setup' do
      let!(:school) { FactoryBot.create(:shs) }
      let!(:course) { FactoryBot.create(:course, school: school) }
      let!(:first_section) { FactoryBot.create(:section, course: course) }
      let!(:second_section) { FactoryBot.create(:section, course: course) }
      let!(:third_section) { FactoryBot.create(:section, course: course) }
      let!(:first_student) { FactoryBot.create(:student, :registered_last_year, grade: '9', school: school) }
      let!(:ssa1) { FactoryBot.create(:student_section_assignment, student: first_student, section: first_section)}
      let!(:second_student) { FactoryBot.create(:student, :registered_last_year, grade: '10', school: school) }
      let!(:ssa2) { FactoryBot.create(:student_section_assignment, student: second_student, section: first_section)}
      let!(:third_student) { FactoryBot.create(:student, :registered_last_year, grade: '9', school: school) }
      let!(:ssa3) { FactoryBot.create(:student_section_assignment, student: third_student, section: first_section)}
      let!(:other_school) { FactoryBot.create(:school) }
      let!(:other_school_course) { FactoryBot.create(:course, school: other_school) }
      let!(:other_school_section) { FactoryBot.create(:section, course: other_school_course) }

      describe '#section_json' do

        context 'educator with section logged in' do
          let!(:educator) { FactoryBot.create(:educator, school: school) }
          let!(:first_esa) { FactoryBot.create(:educator_section_assignment, educator: educator, section: first_section)}
          let!(:second_esa) { FactoryBot.create(:educator_section_assignment, educator: educator, section: second_section)}

          before { sign_in(educator) }

          context 'section params' do

            context 'garbage params' do
              it 'does not raise an error' do
                expect { make_request('garbage section ids rule') }.not_to raise_error
              end
              it 'redirects' do
                make_request('garbage ids rule')
                expect(response.status).to eq 404
              end
            end

            context 'params for section assigned to educator' do
              it 'is successful' do
                make_request(first_section.id)
                expect(response.status).to eq 200
              end
              it 'assigns correct sections to drop-down' do
                make_request(first_section.id)
                expected_section_ids = [first_section, second_section].map(&:id)
                sections = extract_serialized_ids(response, :sections)
                expect(sections).to match_array(expected_section_ids)
              end

              context 'when there are no students' do
                it 'assigns students to empty' do
                  make_request(second_section.id)
                  student_ids = extract_serialized_ids(response, :students)
                  expect(student_ids).to be_empty
                end
              end

              context 'when there are students' do
                it 'assigns rows to a non-empty array' do
                  make_request(first_section.id)
                  expected_student_ids = [first_student, second_student, third_student].map(&:id)
                  student_ids = extract_serialized_ids(response,:students)
                  expect(student_ids).to match_array(expected_student_ids)
                end
              end
            end

            context 'section not accessible to educator' do
              let(:another_section) { FactoryBot.create(:section) }
              it 'guards access' do
                make_request(another_section.id)
                expect(response.status).to eq 403
              end
            end
          end
        end

        context 'admin educator logged in' do
          let(:admin_educator) { FactoryBot.create(:educator, :admin, school: school) }

          before { sign_in(admin_educator) }

          context 'when requesting a section inside their school' do
            it 'is successful' do
              make_request(first_section.id)
              expect(response.status).to eq 200
            end

            it 'assigns correct sections to drop-down' do
              make_request(first_section.id)
              expected_section_ids = [first_section, second_section, third_section].map(&:id)
              sections = extract_serialized_ids(response, :sections)
              expect(sections).to match_array(expected_section_ids)
            end
          end

          context 'when requesting section outside their school' do
            it 'guards access' do
              make_request(other_school_section.id)
              expect(response.status).to eq 403
            end
          end
        end

        context 'districtwide educator logged in' do
          let(:dw_educator) { FactoryBot.create(:educator, districtwide_access: true) }

          before { sign_in(dw_educator) }

          context 'when requesting a section in any school' do
            it 'is successful' do
              make_request(first_section.id)
              expect(response.status).to eq 200
            end

            it 'assigns correct sections to drop-down' do
              make_request(first_section.id)
              expected_section_ids = [first_section, second_section, third_section, other_school_section].map(&:id)
              sections = extract_serialized_ids(response, :sections)
              expect(sections).to match_array(expected_section_ids)
            end
          end
        end
      end
    end
  end
end
