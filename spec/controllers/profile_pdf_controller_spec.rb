require 'rails_helper'

describe ProfilePdfController, :type => :controller do
  def create_event_note(student, educator, params = {})
    FactoryBot.create(:event_note, {
      student: student,
      educator: educator,
    }.merge(params))
  end

  describe '#student_report' do
    let(:educator) { FactoryBot.create(:educator, schoolwide_access: true, school: school) }
    let(:school) { FactoryBot.create(:school) }
    let(:student) { FactoryBot.create(:student, school: school) }

    def get_student_report_pdf(student_id, params = {})
      request.env['HTTPS'] = 'on'
      get :student_report, params: {
        id: student_id,
        format: :pdf,
        from_date: '08/15/2015',
        to_date: '03/16/2017',
        disable_js: true
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
          student_assessment = FactoryBot.create(:access, student: student, assessment: assessment, date_taken: '2016-08-16')

          student_assessment = StarMathResult.create!(
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
  end
end
