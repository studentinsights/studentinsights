require 'rails_helper'


describe SectionsController, :type => :controller do
  def make_request(id = nil)
    request.env['HTTPS'] = 'on'
    get :show, params: { id: id }
  end

  def extract_serialized_ids(controller, instance)
    serialized_data = controller.instance_variable_get(:@serialized_data)
    serialized_data[instance].map {|data_hash| data_hash['id'] }
  end
  
  context 'with test pals setup' do
    let!(:pals) { TestPals.create! }
    context 'happy path' do
      let!(:educator) { pals.shs_bill_nye }
      let!(:section) { pals.shs_tuesday_biology_section }
      before { sign_in(educator) }
      
      it 'returns the right shape of data' do
        make_request(section.id)
        expect(assigns(:serialized_data)[:sections].size).to eq 2
        expect(assigns(:serialized_data)[:students].size).to eq 1
        expect(assigns(:serialized_data)[:students].first.keys).to include(
          'event_notes',
          'most_recent_school_year_absences_count',
          'most_recent_school_year_tardies_count',
          'most_recent_school_year_discipline_incidents_count'
        )
      end
    end
  end

  context 'with controller-specific test setup' do
    let!(:school) { FactoryGirl.create(:shs) }
    let!(:course) { FactoryGirl.create(:course, school: school) }
    let!(:first_section) { FactoryGirl.create(:section, course: course) }
    let!(:second_section) { FactoryGirl.create(:section, course: course) }
    let!(:third_section) { FactoryGirl.create(:section, course: course) }
    let!(:first_student) { FactoryGirl.create(:student, :registered_last_year) }
    let!(:ssa1) { FactoryGirl.create(:student_section_assignment, student: first_student, section: first_section)}
    let!(:second_student) { FactoryGirl.create(:student, :registered_last_year) }
    let!(:ssa2) { FactoryGirl.create(:student_section_assignment, student: second_student, section: first_section)}
    let!(:third_student) { FactoryGirl.create(:student, :registered_last_year) }
    let!(:ssa3) { FactoryGirl.create(:student_section_assignment, student: third_student, section: first_section)}
    let(:other_school) { FactoryGirl.create(:school) }
    let(:other_school_course) { FactoryGirl.create(:course, school: other_school) }
    let(:other_school_section) { FactoryGirl.create(:section, course: other_school_course) }

    describe '#show' do

      context 'educator with section logged in' do
        let!(:educator) { FactoryGirl.create(:educator, school: school) }
        let!(:first_esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: first_section)}
        let!(:second_esa) { FactoryGirl.create(:educator_section_assignment, educator: educator, section: second_section)}

        before { sign_in(educator) }

        context 'section params' do

          context 'garbage params' do
            it 'does not raise an error' do
              expect { make_request('garbage section ids rule') }.not_to raise_error
            end
            it 'redirects to educator\'s first section' do
              make_request('garbage ids rule')
              expect(response).to redirect_to(section_path(educator.sections[0]))
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
              sections = extract_serialized_ids(controller, :sections)
              expect(sections).to match_array(expected_section_ids)
            end

            context 'when there are no students' do
              it 'assigns students to empty' do
                make_request(second_section.id)
                student_ids = extract_serialized_ids(controller, :students)
                expect(student_ids).to be_empty
              end
            end

            context 'when there are students' do
              it 'assigns rows to a non-empty array' do
                make_request(first_section.id)
                expected_student_ids = [first_student, second_student, third_student].map(&:id)
                student_ids = extract_serialized_ids(controller,:students)
                expect(student_ids).to match_array(expected_student_ids)
              end
            end
          end

          context 'section not accessible to educator' do
            let(:another_section) { FactoryGirl.create(:section) }
            it 'redirects' do
              make_request(another_section.id)
              expect(response.status).to eq 302
            end
          end
        end
      end

      context 'admin educator logged in' do
        let(:admin_educator) { FactoryGirl.create(:educator, :admin, school: school) }

        before { sign_in(admin_educator) }

        context 'when requesting a section inside their school' do
          it 'is successful' do
            make_request(first_section.id)
            expect(response.status).to eq 200
          end

          it 'assigns correct sections to drop-down' do
            make_request(first_section.id)
            expected_section_ids = [first_section, second_section, third_section].map(&:id)
            sections = extract_serialized_ids(controller, :sections)
            expect(sections).to match_array(expected_section_ids)
          end
        end

        context 'when requesting section outside their school' do
          it 'redirects' do
            make_request(other_school_section.id)
            expect(response.status).to eq 302
          end
        end
      end

      context 'districtwide educator logged in' do
        let(:dw_educator) { FactoryGirl.create(:educator, districtwide_access: true) }

        before { sign_in(dw_educator) }

        context 'when requesting a section in any school' do
          it 'is successful' do
            make_request(first_section.id)
            expect(response.status).to eq 200
          end

          it 'assigns correct sections to drop-down' do
            make_request(first_section.id)
            expected_section_ids = [first_section, second_section, third_section, other_school_section].map(&:id)
            sections = extract_serialized_ids(controller, :sections)
            expect(sections).to match_array(expected_section_ids)
          end
        end
      end
    end
  end
end