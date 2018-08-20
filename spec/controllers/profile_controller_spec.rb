require 'rails_helper'

describe ProfileController, :type => :controller do
  def create_service(student, educator)
    FactoryBot.create(:service, {
      student: student,
      recorded_by_educator: educator,
      provided_by_educator_name: 'Muraki, Mari'
    })
  end

  def create_event_note(student, educator, params = {})
    FactoryBot.create(:event_note, {
      student: student,
      educator: educator,
    }.merge(params))
  end

  describe '#json' do
    let!(:school) { FactoryBot.create(:school) }
    let(:educator) { FactoryBot.create(:educator_with_homeroom) }
    let(:other_educator) { FactoryBot.create(:educator, full_name: "Teacher, Louis") }
    let(:student) { FactoryBot.create(:student, school: school) }
    let(:course) { FactoryBot.create(:course, school: school) }
    let(:section) { FactoryBot.create(:section, course: course) }
    let!(:ssa) { FactoryBot.create(:student_section_assignment, student: student, section: section) }
    let!(:esa) { FactoryBot.create(:educator_section_assignment, educator: other_educator, section: section)}
    let(:homeroom) { student.homeroom }

    def make_request(options = { student_id: nil, format: :html })
      request.env['HTTPS'] = 'on'
      get :json, params: {
        id: options[:student_id],
        format: options[:format]
      }
    end

    context 'when educator is not logged in' do
      it 'redirects to sign in page' do
        make_request({ student_id: student.id, format: :html })
        expect(response).to redirect_to(new_educator_session_path)
      end
    end

    context 'when educator is logged in' do
      before { sign_in(educator) }

      context 'educator has schoolwide access' do
        let(:educator) { FactoryBot.create(:educator, :admin, school: school, full_name: "Teacher, Karen") }
        let(:serialized_data) { assigns(:serialized_data) }

        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_successful
        end

        it 'assigns the student\'s serialized data correctly' do
          make_request({ student_id: student.id, format: :html })
          expect(serialized_data[:current_educator]['id']).to eq educator['id']
          expect(serialized_data[:current_educator]['email']).to eq educator['email']
          expect(serialized_data[:current_educator]['labels']).to eq []
          expect(serialized_data[:student]["id"]).to eq student.id
          expect(serialized_data[:student]["restricted_notes_count"]).to eq 0

          expect(serialized_data[:dibels]).to eq []
          expect(serialized_data[:feed]).to eq ({
            event_notes: [],
            transition_notes: [],
            services: {
              active: [],
              discontinued: []
            },
            deprecated: {
              interventions: []
            }
          })

          expect(serialized_data[:service_types_index]).to eq({
            502 => {:id=>502, :name=>"Attendance Officer"},
            503 => {:id=>503, :name=>"Attendance Contract"},
            504 => {:id=>504, :name=>"Behavior Contract"},
            505 => {:id=>505, :name=>"Counseling, in-house"},
            506 => {:id=>506, :name=>"Counseling, outside"},
            507 => {:id=>507, :name=>"Reading intervention"},
            508 => {:id=>508, :name=>"Math intervention"},
            509 => {:id=>509, :name=>"SomerSession"},
            510 => {:id=>510, :name=>"Summer Program for English Language Learners"},
            511 => {:id=>511, :name=>"Afterschool Tutoring"},
            512 => {:id=>512, :name=>"Freedom School"},
            513 => {:id=>513, :name=>"Community Schools"},
            514 => {:id=>514, :name=>"X-Block"},
          })

          expect(serialized_data[:educators_index]).to include({
            educator.id => {:id=>educator.id, :email=>educator.email, :full_name=> 'Teacher, Karen'}
          })

          expect(serialized_data[:attendance_data].keys).to eq [
            :discipline_incidents, :tardies, :absences
          ]

          expect(serialized_data[:sections].length).to equal(1)
          expect(serialized_data[:sections][0]["id"]).to eq(section.id)
          expect(serialized_data[:sections][0]["grade_numeric"]).to eq(ssa.grade_numeric)
          expect(serialized_data[:sections][0]["educators"][0]["full_name"]).to eq(other_educator.full_name)
          expect(serialized_data[:current_educator_allowed_sections]).to include(section.id)
        end

        context 'student has multiple discipline incidents' do
          let!(:student) { FactoryBot.create(:student, school: school) }
          let(:most_recent_school_year) { student.most_recent_school_year }
          let(:serialized_data) { assigns(:serialized_data) }
          let(:attendance_data) { serialized_data[:attendance_data] }
          let(:discipline_incidents) { attendance_data[:discipline_incidents] }

          let!(:more_recent_incident) {
            FactoryBot.create(
              :discipline_incident,
              student: student,
              occurred_at: Time.now - 1.day
            )
          }

          let!(:less_recent_incident) {
            FactoryBot.create(
              :discipline_incident,
              student: student,
              occurred_at: Time.now - 2.days
            )
          }

          it 'sets the correct order' do
            make_request({ student_id: student.id, format: :html })
            expect(discipline_incidents).to eq [more_recent_incident, less_recent_incident]
          end
        end
      end

      context 'educator has an associated label' do
        let(:educator) { FactoryBot.create(:educator, :admin, school: school) }
        let!(:label) { EducatorLabel.create!(label_key: 'k8_counselor', educator: educator) }
        let(:serialized_data) { assigns(:serialized_data) }

        it 'serializes the educator label correctly' do
          make_request({ student_id: student.id, format: :html })
          expect(serialized_data[:current_educator]['labels']).to eq ['k8_counselor']
        end
      end

      context 'educator has grade level access' do
        let(:educator) { FactoryBot.create(:educator, grade_level_access: [student.grade], school: school )}

        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_successful
        end
      end

      context 'educator has homeroom access' do
        let(:educator) { FactoryBot.create(:educator, school: school) }
        before { homeroom.update(educator: educator) }

        it 'is successful' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to be_successful
        end
      end

      context 'educator has section access' do
        let!(:educator) { FactoryBot.create(:educator, school: school)}
        let!(:course) { FactoryBot.create(:course, school: school)}
        let!(:section) { FactoryBot.create(:section) }
        let!(:esa) { FactoryBot.create(:educator_section_assignment, educator: educator, section: section) }
        let!(:section_student) { FactoryBot.create(:student, school: school) }
        let!(:ssa) { FactoryBot.create(:student_section_assignment, student: section_student, section: section) }

        it 'is successful' do
          make_request({ student_id: section_student.id, format: :html })
          expect(response).to be_successful
        end
      end

      context 'educator does not have schoolwide, grade level, or homeroom access' do
        let(:educator) { FactoryBot.create(:educator, school: school) }

        it 'fails' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to redirect_to(not_authorized_path)
        end
      end

      context 'educator has some grade level access but for the wrong grade' do
        let(:student) { FactoryBot.create(:student, grade: '1', school: school) }
        let(:educator) { FactoryBot.create(:educator, grade_level_access: ['KF'], school: school) }

        it 'fails' do
          make_request({ student_id: student.id, format: :html })
          expect(response).to redirect_to(not_authorized_path)
        end
      end

      context 'educator access restricted to SPED students' do
        let(:educator) { FactoryBot.create(:educator,
                                            grade_level_access: ['1'],
                                            restricted_to_sped_students: true,
                                            school: school )
        }

        context 'student in SPED' do
          let(:student) { FactoryBot.create(:student,
                                              grade: '1',
                                              program_assigned: 'Sp Ed',
                                              school: school)
          }

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_successful
          end
        end

        context 'student in Reg Ed' do
          let(:student) { FactoryBot.create(:student,
                                              grade: '1',
                                              program_assigned: 'Reg Ed')
          }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end

      end

      context 'educator access restricted to ELL students' do
        let(:educator) { FactoryBot.create(:educator,
                                            grade_level_access: ['1'],
                                            restricted_to_english_language_learners: true,
                                            school: school )
        }

        context 'limited English proficiency' do
          let(:student) { FactoryBot.create(:student,
                                              grade: '1',
                                              limited_english_proficiency: 'FLEP',
                                              school: school)
          }

          it 'is successful' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to be_successful
          end
        end

        context 'fluent in English' do
          let(:student) { FactoryBot.create(:student,
                                              grade: '1',
                                              limited_english_proficiency: 'Fluent')
          }

          it 'fails' do
            make_request({ student_id: student.id, format: :html })
            expect(response).to redirect_to(not_authorized_path)
          end
        end
      end
    end
  end

  describe '#serialize_student_for_profile' do
    it 'returns a hash with the additional keys that UI code expects' do
      student = FactoryBot.create(:student)
      serialized_student = controller.send(:serialize_student_for_profile, student)
      expect(serialized_student.keys).to include(*[
        'absences_count',
        'tardies_count',
        'school_name',
        'homeroom_name',
        'house',
        'counselor',
        'sped_liaison',
        'discipline_incidents_count'
      ])
    end
  end

  describe '#student_feed' do
    let(:student) { FactoryBot.create(:student) }
    let(:educator) { FactoryBot.create(:educator, :admin) }
    let!(:service) { create_service(student, educator) }
    let!(:event_note) { create_event_note(student, educator) }

    it 'returns services' do
      feed = controller.send(:student_feed, student)
      expect(feed.keys).to contain_exactly(:event_notes, :services, :deprecated, :transition_notes)
      expect(feed[:services].keys).to eq [:active, :discontinued]
      expect(feed[:services][:discontinued].first[:id]).to eq service.id
    end

    it 'returns event notes' do
      feed = controller.send(:student_feed, student)
      event_notes = feed[:event_notes]

      expect(event_notes.size).to eq 1
      expect(event_notes.first[:student_id]).to eq(student.id)
      expect(event_notes.first[:educator_id]).to eq(educator.id)
    end

    context 'after service is discontinued' do
      it 'filters it' do
        feed = controller.send(:student_feed, student)
        expect(feed[:services][:active].size).to eq 0
        expect(feed[:services][:discontinued].first[:id]).to eq service.id
      end
    end
  end
end
