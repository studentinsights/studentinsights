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

    context 'when PerDistrict#enabled_sections? false'  do
      before do
        mock_per_district = PerDistrict.new
        allow(mock_per_district).to receive(:enabled_sections?).and_return(false)
        allow(PerDistrict).to receive(:new).and_return(mock_per_district)
      end
      it 'guards access' do
        get_my_sections_json(pals.shs_fatima_science_teacher)
        expect(response.status).to eq 403
      end
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
            "course_description"=>"PHYSICS 1",
            "school"=>{"id"=>pals.shs.id, "name"=>"Somerville High", "local_id"=>"SHS", "slug"=>"shs"}
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
            "course_description"=>"PHYSICS 1",
            "school"=>{"id"=>pals.shs.id, "name"=>"Somerville High", "local_id"=>"SHS", "slug"=>"shs"}
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

    it 'works as expected across all TestPals' do
      sections_by_educator_login_name = Educator.all.reduce({}) do |map, educator|
        json = response_json_for_get_my_sections_json(educator)
        sign_out(educator)
        map.merge(educator.login_name => json['sections'].map {|s| s['id'].to_i }.sort)
      end
      expect(sections_by_educator_login_name).to eq({
        "alonso" => [],
        "bill" => [
          pals.shs_tuesday_biology_section.id,
          pals.shs_thursday_biology_section.id
        ],
        "fatima" => [
          pals.shs_third_period_physics.id,
          pals.shs_fifth_period_physics.id
        ],
        "harry" => [],
        "hugo" => [
          pals.shs_second_period_ceramics.id,
          pals.shs_fourth_period_ceramics.id
        ],
        "jodi" => [],
        "laura" => [],
        "les" => [],
        "marcus" => [],
        "rich" => [],
        "sarah" => [],
        "silva" => [],
        "sofia" => [],
        "uri" => [],
        "vivian" => [],
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
        mock_per_district = PerDistrict.new
        allow(mock_per_district).to receive(:enabled_sections?).and_return(false)
        allow(PerDistrict).to receive(:new).and_return(mock_per_district)
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
          Timecop.freeze(pals.time_now) do
            make_request(section.id)
            json = JSON.parse(response.body)
            expect(json['section'].except('created_at', 'updated_at')).to eq({
              "id" => section.id,
              "section_number" => "SHS-BIO-TUES",
              "term_local_id" => "Q3",
              "schedule" => nil,
              "room_number" => nil,
              "course_id" => section.course.id,
              "district_school_year" => 2018,
              "course_number" => "BIO-700",
              "course_description" => "BIOLOGY 1 HONORS",
              "course" => {
                "school" => {
                  "id" => pals.shs.id,
                  "name" => "Somerville High",
                  "local_id" => "SHS",
                  "slug" => "shs"
                }
              }
            })
            expect(json['students'].size).to eq 1
            expect(json['students'].first.keys).to include(
              'event_notes_without_restricted',
              'most_recent_school_year_absences_count',
              'most_recent_school_year_tardies_count',
              'most_recent_school_year_discipline_incidents_count'
            )
            expect(json['sections'].size).to eq 2
            expect(json['sections'].flat_map(&:keys).uniq).to contain_exactly(*[
              'id',
              'section_number',
              'term_local_id',
              'course_description'
            ])
          end
        end

        it 'only includes sections with current district_school_year' do
          Timecop.freeze(pals.time_now + 1.year) do
            make_request(section.id)
            json = JSON.parse(response.body)
            expect(json['sections'].size).to eq 0
          end
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

      it 'enforces authorization as expected across all TestPals' do
        all_section_ids = Section.all.map(&:id).sort
        assigned_section_ids_by_name = Educator.all.reduce({}) do |map, educator|
          sign_in(educator)
          section_ids = all_section_ids.select do |section_id|
            make_request(section_id)
            response.status == 200
          end
          sign_out(educator)
          map.merge(educator.login_name => section_ids.sort)
        end
        expect(assigned_section_ids_by_name).to eq({
          "alonso" => [],
          "bill" => [
            pals.shs_tuesday_biology_section.id,
            pals.shs_thursday_biology_section.id
          ],
          "fatima" => all_section_ids,
          "harry" => all_section_ids,
          "hugo" => [
            pals.shs_second_period_ceramics.id,
            pals.shs_fourth_period_ceramics.id
          ],
          "jodi" => [],
          "laura" => [],
          "les" => [],
          "marcus" => [],
          "rich" => all_section_ids,
          "sarah" => [],
          "silva" => [],
          "sofia" => all_section_ids,
          "uri" => all_section_ids,
          "vivian" => [],
        })
      end

      it 'returns expected sections for navigator across all requests for each TestPal' do
        Timecop.freeze(pals.time_now) do
          all_section_ids = Section.all.map(&:id).sort

          # collect all section_ids
          section_ids_by_login_name = {}
          Educator.all.each do |educator|
            sign_in(educator)
            section_ids_by_login_name[educator.login_name] = []
            all_section_ids.each do |section_id|
              make_request(section_id)
              if response.status == 200
                json = JSON.parse(response.body)
                section_ids_from_request = json['sections'].map {|s| s['id'].to_i }
                section_ids_by_login_name[educator.login_name] = (section_ids_by_login_name[educator.login_name] + section_ids_from_request).uniq.sort
              end
            end
            sign_out(educator)
          end

          expect(section_ids_by_login_name).to eq({
            "alonso" => [],
            "bill" => [
              pals.shs_tuesday_biology_section.id,
              pals.shs_thursday_biology_section.id
            ],
            "fatima" => all_section_ids,
            "harry" => all_section_ids,
            "hugo" => [
              pals.shs_second_period_ceramics.id,
              pals.shs_fourth_period_ceramics.id
            ],
            "jodi" => [],
            "laura" => [],
            "les" => [],
            "marcus" => [],
            "rich" => all_section_ids,
            "sarah" => [],
            "silva" => [],
            "sofia" => all_section_ids,
            "uri" => all_section_ids,
            "vivian" => []
          })
        end
      end
    end

    context 'with MS sections' do
      let!(:pals) { TestPals.create! }
      let!(:young_mozart) { FactoryBot.create(:student, :registered_last_year, grade: '3', school: pals.healey) }
      let!(:music_course) { FactoryBot.create(:course, school: pals.healey, course_number: 'MUSIC101') }
      let!(:music_section) { FactoryBot.create(:section, course: music_course) }
      let!(:student_assignment) { FactoryBot.create(:student_section_assignment, student: young_mozart, section: music_section)}
      let!(:educator_assignment) { FactoryBot.create(:educator_section_assignment, educator: pals.healey_vivian_teacher, section: music_section)}

      it 'allows access to student because of Section assignment, even if K8' do
        sign_in(pals.healey_vivian_teacher)
        make_request(music_section.id)
        expect(response.status).to eq 200
        expect(extract_serialized_ids(response, :students)).to eq [young_mozart.id]
        expect(extract_serialized_ids(response, :sections)).to eq [music_section.id]
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
        it 'enforces section-level authorization' do
          educators_without_section_access = Educator.all - [
            high_school_educator,
            pals.uri,
            pals.rich_districtwide,
            pals.shs_fatima_science_teacher,
            pals.shs_harry_housemaster,
            pals.shs_sofia_counselor
          ]
          educators_without_section_access.each do |educator|
            sign_in(educator)
            make_request(first_section.id)
            expect(response.status).to eq 403
            sign_out(educator)
          end
          expect(educators_without_section_access.size).to eq 10
        end

        it 'enforces student-level authorization, beyond just section-level authorization' do
          sign_in(high_school_educator)
          make_request(first_section.id)
          expect(response.status).to eq 200
          expect(extract_serialized_ids(response, :students)).to eq []
          expect(extract_serialized_ids(response, :sections)).to eq [first_section.id]
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
