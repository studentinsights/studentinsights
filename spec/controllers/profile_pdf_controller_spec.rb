# typed: false
require 'rails_helper'

describe ProfilePdfController, :type => :controller do
  # eg, for testing send_data_log_subscriber.rb
  def mock_subscribers_log!
    log = LogHelper::RailsLogger.new
    ActiveSupport::Subscriber.subscribers.each do |subscriber|
      allow(subscriber).to receive(:logger).and_return(log)
    end
    log
  end

  def create_event_note(student, educator, params = {})
    FactoryBot.create(:event_note, {
      student: student,
      educator: educator,
    }.merge(params))
  end

  describe '#student_report' do
    let(:educator) { FactoryBot.create(:educator, :admin, school: school) }
    let(:school) { FactoryBot.create(:school) }
    let(:student) { FactoryBot.create(:student, school: school) }

    def get_student_report_pdf(student_id, params = {})
      request.env['HTTPS'] = 'on'
      get :student_report, params: {
        id: student_id,
        format: :pdf,
        from_date: '08/15/2015',
        to_date: '03/16/2017',
        disable_js: true,
        include_restricted_notes: false
      }.merge(params)
    end

    context 'when educator is not logged in' do
      it 'does not render a student report' do
        get_student_report_pdf(student.id)
        expect(response.status).to eq 401
      end
    end

    context 'when educator is logged in' do
      before do
        sign_in(educator)
        get_student_report_pdf(student.id)
      end

      context 'educator has schoolwide access' do

        it 'is successful' do
          expect(response).to be_successful
        end

        it 'assigns the student correctly' do
          expect(assigns(:student)).to eq student
        end

        it 'assigns the student\'s services correctly with full history' do
          old_service = FactoryBot.create(:service, date_started: '2012-02-22', student: student, discontinued_at: '2012-05-21')
          recent_service = FactoryBot.create(:service, date_started: '2016-01-13', student: student, discontinued_at: nil)
          expect(assigns(:services)).not_to include(old_service)
          expect(assigns(:services)).to include(recent_service)
        end

        it 'assigns the student\'s notes correctly excluding restricted notes' do
          restricted_note = FactoryBot.create(:event_note, :restricted, student: student, educator: educator)
          note = FactoryBot.create(:event_note, student: student, educator: educator)
          expect(assigns(:event_notes)).to include(note)
          expect(assigns(:event_notes)).not_to include(restricted_note)
        end

        it 'assigns the student\'s school years correctly' do
          incident = FactoryBot.create(:discipline_incident, student: student, occurred_at: '2015-08-15')
          absence = FactoryBot.create(:absence, student: student, occurred_at: '2015-08-16')
          tardy = FactoryBot.create(:tardy, student: student, occurred_at: '2015-08-17')
          get_student_report_pdf(student.id)

          expect(assigns(:student_school_years)[0].discipline_incidents).to include(incident)
          expect(assigns(:student_school_years)[0].absences).to include(absence)
          expect(assigns(:student_school_years)[0].tardies).to include(tardy)
        end

        it 'assigns the student\'s discipline incidents correctly' do
          incident = FactoryBot.create(:discipline_incident, student: student, occurred_at: '2015-08-15')
          old_incident = FactoryBot.create(:discipline_incident, student: student, occurred_at: '2015-08-14')
          get_student_report_pdf(student.id)

          expect(assigns(:discipline_incidents)).to include(incident)
          expect(assigns(:discipline_incidents)).not_to include(old_incident)
        end

        it 'assigns the student\'s assesments correctly' do
          assessment = FactoryBot.create(:assessment, :access)
          FactoryBot.create(:access, student: student, assessment: assessment, date_taken: '2016-08-16')

          StarMathResult.create!(
            student: student,
            date_taken: '2017-02-16',
            percentile_rank: 57,
            grade_equivalent: '5.0',
            total_time: 10)

          get_student_report_pdf(student.id)

          expect(assigns(:student_assessments)).to include("ACCESS Composite")
          expect(assigns(:student_assessments)["ACCESS Composite"]).to be_kind_of(Array)
          expect(assigns(:student_assessments)["ACCESS Composite"]).to eq([["2016-08-16 00:00:00 UTC", nil]])
          expect(assigns(:student_assessments)).to include("STAR Math Percentile")
          expect(assigns(:student_assessments)["STAR Math Percentile"]).to be_kind_of(Array)
          expect(assigns(:student_assessments)["STAR Math Percentile"]).to eq([["2017-02-16 00:00:00 UTC", 57]])
        end
      end
    end

    it 'includes notes from the current day' do
      sign_in(educator)
      event_note_today = create_event_note(student, educator, {
        text: 'foobar',
        recorded_at: Time.parse('2017-03-16 11:12:00')
      })
      get_student_report_pdf(student.id)
      expect(response).to be_successful
      expect(assigns(:event_notes)).to include(event_note_today)
    end

    it 'does not raise when rendering the Rails view' do
      sign_in(educator)
      get_student_report_pdf(student.id)
      expect(response).to be_successful
      expect(response.headers).to eq({
        "Content-Type" => "application/pdf",
        "Content-Disposition" => "inline; filename=\"student_report.pdf\"",
        "Content-Transfer-Encoding" => "binary",
        "Cache-Control" => "private"
      })
    end

    it 'scrubs filename from log output' do
      log = mock_subscribers_log!
      sign_in(educator)
      get_student_report_pdf(student.id)
      expect(response).to be_successful
      expect(log.output).to include('Sent data [FILTERED]')
    end

    describe 'guard access to restricted notes' do
      let!(:pals) { TestPals.create! }

      def create_test_notes(pals)
        event_note = create_event_note(pals.healey_kindergarten_student, pals.healey_vivian_teacher, {
          text: 'plain note',
          recorded_at: Time.parse('2017-03-11 11:17:00'),
          is_restricted: false
        })
        restricted_event_note = create_event_note(pals.healey_kindergarten_student, pals.healey_vivian_teacher, {
          text: 'DANGER UNSAFE RESTRICTED NOTE',
          recorded_at: Time.parse('2017-03-04 11:03:00'),
          is_restricted: true
        })
        [event_note, restricted_event_note]
      end

      it 'excludes without permission' do
        event_note, restricted_event_note = create_test_notes(pals)

        sign_in(pals.healey_vivian_teacher)
        get_student_report_pdf(pals.healey_kindergarten_student.id, {
          include_restricted_notes: 'true'
        })
        expect(response).to be_successful
        expect(assigns(:event_notes)).to include(event_note)
        expect(assigns(:event_notes)).not_to include(restricted_event_note)
      end

      it 'excludes without explicit request' do
        event_note, restricted_event_note = create_test_notes(pals)
        sign_in(pals.uri)
        get_student_report_pdf(pals.healey_kindergarten_student.id, {
          include_restricted_notes: 'false'
        })
        expect(assigns(:event_notes)).to include(event_note)
        expect(assigns(:event_notes)).not_to include(restricted_event_note)
      end

      it 'includes only with permission and explicit request' do
        event_note, restricted_event_note = create_test_notes(pals)
        sign_in(pals.uri)
        get_student_report_pdf(pals.healey_kindergarten_student.id, {
          include_restricted_notes: 'true'
        })
        expect(assigns(:event_notes)).to include(event_note)
        expect(assigns(:event_notes)).to include(restricted_event_note)
      end
    end
  end
end
