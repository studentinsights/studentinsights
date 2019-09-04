require 'rails_helper'

describe HomeroomsController, :type => :controller do
  let!(:school) { FactoryBot.create(:school) }

  describe '#homeroom_json' do
    def make_request(id = nil)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :homeroom_json, params: { id: id }
    end

    context 'happy path' do
      let!(:pals) { TestPals.create! }
      let!(:educator) { pals.healey_vivian_teacher }
      let!(:homeroom) { pals.healey_kindergarten_homeroom }
      before { sign_in(educator) }

      it 'returns the right shape of data' do
        make_request(educator.homeroom.id)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['rows'].length).to eq 1
        expect(json['rows'].first.keys).to match_array([
          "id",
          "grade",
          "hispanic_latino",
          "race",
          "free_reduced_lunch",
          "created_at",
          "updated_at",
          "homeroom_id",
          "first_name",
          "last_name",
          "has_photo",
          "state_id",
          "home_language",
          "school_id",
          "registration_date",
          "local_id",
          "program_assigned",
          "sped_placement",
          "disability",
          "sped_level_of_need",
          "plan_504",
          "limited_english_proficiency",
          "ell_entry_date",
          "ell_transition_date",
          "most_recent_mcas_math_growth",
          "most_recent_mcas_ela_growth",
          "most_recent_mcas_math_performance",
          "most_recent_mcas_ela_performance",
          "most_recent_mcas_math_scaled",
          "most_recent_mcas_ela_scaled",
          "most_recent_star_reading_percentile",
          "most_recent_star_math_percentile",
          "enrollment_status",
          "missing_from_last_export",
          "date_of_birth",
          "gender",
          "house",
          "counselor",
          "sped_liaison",
          "discipline_incidents_count",
          "absences_count",
          "tardies_count",
          "homeroom_name",
          "event_notes_without_restricted",
          "interventions",
          "sped_data",
        ])
      end

      it 'works with an id' do
        make_request(educator.homeroom.id)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['rows'].length).to eq 1
      end

      it 'does not work with a slug' do
        make_request(educator.homeroom.slug)
        expect(response.status).to eq 404
      end
    end

    context 'educator with homeroom logged in' do
      let!(:educator) { FactoryBot.create(:educator, school: school) }
      let!(:homeroom) { FactoryBot.create(:homeroom, educator: educator, grade: "5", school: school) }
      before { sign_in(educator) }

      context 'homeroom params' do

        context 'garbage params' do
          it 'raises' do
            make_request('garbage homeroom ids rule')
            expect(response.status).to eq 404
          end
        end

        context 'params for homeroom belonging to educator' do
          it 'is successful' do
            make_request(educator.homeroom.id)
            expect(response.status).to eq 200
          end
          it 'assigns correct homerooms to drop-down' do
            make_request(educator.homeroom.id)
            json = JSON.parse(response.body)
            expect(json['homerooms']).to eq([educator.homeroom].as_json(only: [:slug, :name]))
          end

          context 'when there are no students' do
            it 'assigns rows to empty' do
              make_request(educator.homeroom.id)
              json = JSON.parse(response.body)
              expect(json['rows']).to be_empty
            end
          end

          context 'when there are students' do
            let!(:first_student) { FactoryBot.create(:student, :registered_last_year, homeroom: educator.homeroom) }
            let!(:second_student) { FactoryBot.create(:student, :registered_last_year, homeroom: educator.homeroom) }
            let!(:third_student) { FactoryBot.create(:student, :registered_last_year) }

            it 'assigns rows to a non-empty array' do
              make_request(educator.homeroom.id)
              expected_student_ids = [first_student, second_student].map(&:id)
              json = JSON.parse(response.body)
              expect(json['rows'].map {|row| row['id'] }).to match_array(expected_student_ids)
            end
          end
        end

        context 'homeroom does not belong to educator' do

          context 'homeroom is grade level as educator\'s and same school' do
            let(:another_homeroom) { FactoryBot.create(:homeroom, grade: '5', school: school) }
            it 'is successful' do
              make_request(another_homeroom.id)
              expect(response.status).to eq 200
            end
          end

          context 'homeroom is grade level as educator\'s -- but different school!' do
            let(:another_homeroom) { FactoryBot.create(:homeroom, grade: '5', school: FactoryBot.create(:school)) }
            it 'guards access' do
              make_request(another_homeroom.id)
              expect(response.status).to eq 403
            end
          end

          context 'homeroom is different grade level from educator\'s' do
            let(:yet_another_homeroom) { FactoryBot.create(:homeroom, school: school) }
            it 'guards access' do
              make_request(yet_another_homeroom.id)
              expect(response.status).to eq 403
            end
          end

          context 'educator has appropriate grade level access' do
            let(:educator) { FactoryBot.create(:educator, grade_level_access: ['5'], school: school) }
            let(:homeroom) { FactoryBot.create(:homeroom, grade: '5', school: school) }

            it 'is successful' do
              make_request(homeroom.id)
              expect(response.status).to eq 200
            end
          end

          context 'educator does not have correct grade level access, but has access to a different grade' do
            let(:school) { FactoryBot.create(:school) }
            before { FactoryBot.create(:student, school: school) }
            let(:educator) { FactoryBot.create(:educator, grade_level_access: ['3'], school: school )}
            let(:homeroom) { FactoryBot.create(:homeroom, grade: '5', school: school) }

            it 'redirects' do
              make_request(homeroom.id)
              expect(response.status).to eq(403)
            end
          end

        end

      end

      context 'no homeroom params' do
        it 'raises an error' do
          expect { make_request }.to raise_error ActionController::UrlGenerationError
        end
      end

    end

    context 'admin educator logged in' do
      let(:admin_educator) { FactoryBot.create(:educator, :admin, school: school) }
      before { sign_in(admin_educator) }

      context 'no homeroom params' do
        it 'raises an error' do
          expect { make_request }.to raise_error ActionController::UrlGenerationError
        end
      end

      context 'homeroom params' do
        context 'good homeroom params' do
          let(:homeroom) { FactoryBot.create(:homeroom, grade: '5', school: school) }
          it 'is successful' do
            make_request(homeroom.id)
            expect(response.status).to eq 200
          end
          it 'assigns correct homerooms to drop-down' do
            make_request(homeroom.id)
            json = JSON.parse(response.body)
            expect(json['homerooms']).to contain_exactly(*Homeroom.all.as_json(only: [:name, :slug]))
          end
        end

        context 'garbage homeroom params' do
          before { FactoryBot.create(:student, school: school) }
          it 'fails' do
            make_request('garbage homeroom ids rule')
            expect(response.status).to eq(404)
          end
        end

      end
    end

    context 'educator without schoolwide access logged in' do
      before { sign_in(FactoryBot.create(:educator)) }

      context 'no homeroom params' do
        it 'raises an error' do
          expect { make_request }.to raise_error ActionController::UrlGenerationError
        end
      end

      context 'homeroom params' do
        let!(:homeroom) { FactoryBot.create(:homeroom) }
        it 'guards access' do
          make_request(homeroom.id)
          expect(response.status).to eq(403)
        end
      end
    end

    context 'educator not logged in' do
      let!(:educator) { FactoryBot.create(:educator, school: school) }
      let!(:homeroom) { FactoryBot.create(:homeroom, educator: educator, grade: "5", school: school) }

      it 'redirects to sign in page' do
        make_request(educator.homeroom.id)
        expect(response.status).to eq(401)
      end
    end

    context 'returns list of homerooms' do
      let!(:pals) { TestPals.create! }

      it 'works as expected before cutover, when unit testing #authorized_homerooms method' do
        allowed_access_map = Educator.all.reduce({}) do |map, educator|
          allow(controller).to receive(:current_educator).and_return(educator)
          homeroom_slugs = controller.send(:authorized_homerooms).map(&:slug).sort
          map.merge(educator.login_name.to_sym => homeroom_slugs)
        end
        expect(allowed_access_map).to eq({
          alonso: [],
          bill: ["shs-917", "shs-942"],
          fatima: ["shs-917", "shs-942", "shs-all"],
          harry: ["shs-917", "shs-942", "shs-all"],
          hugo: [],
          jodi: ["shs-917", "shs-942"],
          laura: ["hea-003", "hea-500"],
          les: ["wsns-501"],
          marcus: ["wsns-501"],
          rich: ["hea-003", "hea-500", "shs-917", "shs-942", "shs-all", "wsns-501"],
          sarah: ["hea-500"],
          silva: [],
          sofia: ["shs-917", "shs-942", "shs-all"],
          uri: ["hea-003", "hea-500", "shs-917", "shs-942", "shs-all", "wsns-501"],
          vivian: ["hea-003"],
        })
      end

      it 'works as expected after cutover, when unit testing #authorized_homerooms method' do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('ENABLE_HOMEROOM_AUTHORIZATION_V2').and_return('true')
        allowed_access_map = Educator.all.reduce({}) do |map, educator|
          allow(controller).to receive(:current_educator).and_return(educator)
          homeroom_slugs = controller.send(:authorized_homerooms).map(&:slug).sort
          map.merge(educator.login_name.to_sym => homeroom_slugs)
        end
        expect(allowed_access_map).to eq({
          alonso: [],
          bill: [],
          fatima: ["shs-942"],
          harry: ["shs-942"],
          hugo: [],
          jodi: ["shs-942"],
          laura: ["hea-003"],
          les: [],
          marcus: [],
          rich: ["hea-003", "shs-942"],
          sarah: [],
          silva: [],
          sofia: ["shs-942"],
          uri: ["hea-003", "shs-942"],
          vivian: ["hea-003"],
        })
      end
    end

    context 'guards access' do
      let!(:pals) { TestPals.create! }

      def get_homeroom(educator, homeroom)
        request.env['HTTPS'] = 'on'
        sign_in(educator)
        request.env['HTTP_ACCEPT'] = 'application/json'
        get :homeroom_json, params: { id: homeroom.id }
        r = response
        sign_out(educator)
        r
      end

      def allowed_access_to(educator)
        allowed_homerooms = Homeroom.all.select do |homeroom|
          get_homeroom(educator, homeroom).status == 200
        end
        allowed_homerooms.map(&:slug).sort
      end

      it 'works across TestPals, before cutover' do
        allowed_access_map = Educator.all.reduce({}) do |map, educator|
          homeroom_slugs = allowed_access_to(educator)
          map.merge(educator.login_name.to_sym => homeroom_slugs)
        end
        expect(allowed_access_map).to eq({
          alonso: [],
          bill: ['shs-917', 'shs-942'],
          fatima: ['shs-917', 'shs-942', 'shs-all'],
          harry: ['shs-917', 'shs-942', 'shs-all'],
          hugo: [],
          jodi: ['shs-917', 'shs-942'],
          laura: ['hea-003', 'hea-500'],
          les: ['wsns-501'],
          marcus: ['wsns-501'],
          rich: ['hea-003', 'hea-500', 'shs-917', 'shs-942', 'shs-all', 'wsns-501'],
          sarah: ['hea-500'],
          silva: [],
          sofia: ['shs-917', 'shs-942', 'shs-all'],
          uri: ['hea-003', 'hea-500', 'shs-917', 'shs-942', 'shs-all', 'wsns-501'],
          vivian: ['hea-003'],
        })
      end

      it 'works across TestPals, after cutover' do
        allow(ENV).to receive(:[]).and_call_original
        allow(ENV).to receive(:[]).with('ENABLE_HOMEROOM_AUTHORIZATION_V2').and_return('true')
        allowed_access_map = Educator.all.reduce({}) do |map, educator|
          homeroom_slugs = allowed_access_to(educator)
          map.merge(educator.login_name.to_sym => homeroom_slugs)
        end
        expect(allowed_access_map).to eq({
          alonso: [],
          bill: [],
          fatima: ["shs-942"],
          harry: ["shs-942"],
          hugo: [],
          jodi: ["shs-942"],
          laura: ["hea-003"],
          les: [],
          marcus: [],
          rich: ["hea-003", "shs-942"],
          sarah: [],
          silva: [],
          sofia: ["shs-942"],
          uri: ["hea-003", "shs-942"],
          vivian: ['hea-003'],
        })
      end
    end
  end

  describe '#find_homeroom_by_id' do
    it 'only works with explicit id' do
      homeroom_one = FactoryBot.create(:homeroom, id: 1, name: '7-263')
      homeroom_two = FactoryBot.create(:homeroom, id: 7, name: '1')
      homeroom_three = FactoryBot.create(:homeroom, id: 14, name: '7')
      homeroom_four = FactoryBot.create(:homeroom, id: 77, name: '99')

      # matching
      expect(controller.send(:find_homeroom_by_id, '1')).to eq homeroom_one
      expect(controller.send(:find_homeroom_by_id, 1)).to eq homeroom_one
      expect(controller.send(:find_homeroom_by_id, '7')).to eq homeroom_two
      expect(controller.send(:find_homeroom_by_id, 7)).to eq homeroom_two
      expect(controller.send(:find_homeroom_by_id, '14')).to eq homeroom_three
      expect(controller.send(:find_homeroom_by_id, 14)).to eq homeroom_three
      expect(controller.send(:find_homeroom_by_id, '77')).to eq homeroom_four
      expect(controller.send(:find_homeroom_by_id, 77)).to eq homeroom_four

      # no overmatching
      expect { controller.send(:find_homeroom_by_id, '99') }.to raise_error(ActiveRecord::RecordNotFound)
      expect { controller.send(:find_homeroom_by_id, 99) }.to raise_error(ActiveRecord::RecordNotFound)
      expect { controller.send(:find_homeroom_by_id, '7-263') }.to raise_error(ActiveRecord::RecordNotFound)
      expect { controller.send(:find_homeroom_by_id, 'xyz') }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
