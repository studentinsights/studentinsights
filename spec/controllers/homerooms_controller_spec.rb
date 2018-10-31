require 'rails_helper'

describe HomeroomsController, :type => :controller do
  let!(:school) { FactoryBot.create(:school) }

  describe '#homeroom_json' do
    def make_request(slug = nil)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :homeroom_json, params: { id: slug }
    end

    context 'happy path' do
      let!(:pals) { TestPals.create! }
      let!(:educator) { pals.healey_vivian_teacher }
      let!(:homeroom) { pals.healey_kindergarten_homeroom }
      before { sign_in(educator) }

      it 'returns the right shape of data' do
        make_request(educator.homeroom.slug)
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

      it 'works with an id instead of slug' do
        make_request(educator.homeroom.id)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['rows'].length).to eq 1
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
            make_request(educator.homeroom.slug)
            expect(response.status).to eq 200
          end
          it 'assigns correct homerooms to drop-down' do
            make_request(educator.homeroom.slug)
            json = JSON.parse(response.body)
            expect(json['homerooms']).to eq([educator.homeroom].as_json(only: [:slug, :name]))
          end

          context 'when there are no students' do
            it 'assigns rows to empty' do
              make_request(educator.homeroom.slug)
              json = JSON.parse(response.body)
              expect(json['rows']).to be_empty
            end
          end

          context 'when there are students' do
            let!(:first_student) { FactoryBot.create(:student, :registered_last_year, homeroom: educator.homeroom) }
            let!(:second_student) { FactoryBot.create(:student, :registered_last_year, homeroom: educator.homeroom) }
            let!(:third_student) { FactoryBot.create(:student, :registered_last_year) }

            it 'assigns rows to a non-empty array' do
              make_request(educator.homeroom.slug)
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
              make_request(another_homeroom.slug)
              expect(response.status).to eq 200
            end
          end

          context 'homeroom is grade level as educator\'s -- but different school!' do
            let(:another_homeroom) { FactoryBot.create(:homeroom, grade: '5', school: FactoryBot.create(:school)) }
            it 'guards access' do
              make_request(another_homeroom.slug)
              expect(response.status).to eq 403
            end
          end

          context 'homeroom is different grade level from educator\'s' do
            let(:yet_another_homeroom) { FactoryBot.create(:homeroom, school: school) }
            it 'guards access' do
              make_request(yet_another_homeroom.slug)
              expect(response.status).to eq 403
            end
          end

          context 'educator has appropriate grade level access' do
            let(:educator) { FactoryBot.create(:educator, grade_level_access: ['5'], school: school) }
            let(:homeroom) { FactoryBot.create(:homeroom, grade: '5', school: school) }

            it 'is successful' do
              make_request(homeroom.slug)
              expect(response.status).to eq 200
            end
          end

          context 'educator does not have correct grade level access, but has access to a different grade' do
            let(:school) { FactoryBot.create(:school) }
            before { FactoryBot.create(:student, school: school) }
            let(:educator) { FactoryBot.create(:educator, grade_level_access: ['3'], school: school )}
            let(:homeroom) { FactoryBot.create(:homeroom, grade: '5', school: school) }

            it 'redirects' do
              make_request(homeroom.slug)
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
            make_request(homeroom.slug)
            expect(response.status).to eq 200
          end
          it 'assigns correct homerooms to drop-down' do
            make_request(homeroom.slug)
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
          make_request(homeroom.slug)
          expect(response.status).to eq(403)
        end
      end
    end

    context 'educator not logged in' do
      let!(:educator) { FactoryBot.create(:educator, school: school) }
      let!(:homeroom) { FactoryBot.create(:homeroom, educator: educator, grade: "5", school: school) }

      it 'redirects to sign in page' do
        make_request(educator.homeroom.slug)
        expect(response.status).to eq(401)
      end
    end

  end

  describe '#find_homeroom_by_id_or_slug' do
    it 'works with different input types' do
      homeroom_one = FactoryBot.create(:homeroom, id: 1, name: '7-263')
      homeroom_two = FactoryBot.create(:homeroom, id: 7, name: '1')

      expect(controller.send(:find_homeroom_by_id_or_slug, '7-263')).to eq homeroom_one
      expect(controller.send(:find_homeroom_by_id_or_slug, '1')).to eq homeroom_one
      expect(controller.send(:find_homeroom_by_id_or_slug, 1)).to eq homeroom_one
      expect(controller.send(:find_homeroom_by_id_or_slug, '7')).to eq homeroom_two
      expect(controller.send(:find_homeroom_by_id_or_slug, 7)).to eq homeroom_two
      expect { controller.send(:find_homeroom_by_id_or_slug, 'xyz') }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
