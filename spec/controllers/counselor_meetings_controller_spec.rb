require 'rails_helper'

describe CounselorMeetingsController, :type => :controller do
  let!(:pals) { TestPals.create! }

  def post_create(educator, params = {})
    sign_in(educator)
    request.env['HTTPS'] = 'on'
    post :create, params: { format: :json }.merge(params)
  end

  def get_meetings_json(educator, params = {})
    sign_in(educator)
    request.env['HTTPS'] = 'on'
    get :meetings_json, params: { format: :json }.merge(params)
  end

  def get_student_feed_cards_json(educator, params = {})
    sign_in(educator)
    request.env['HTTPS'] = 'on'
    get :student_feed_cards_json, params: { format: :json }.merge(params)
  end

  describe '#create' do
    it 'guards accesss by label' do
      (Educator.all - [pals.shs_sofia_counselor]).each do |educator|
        post_create(educator, {
          student_id: pals.shs_freshman_mari.id,
          meeting_date: '2017-03-21'
        })
        expect(response.status).to eq 403
      end
    end

    it 'guards access by student' do
      [pals.healey_kindergarten_student, pals.west_eighth_ryan].each do |student|
        post_create(pals.shs_sofia_counselor, {
          student_id: student.id,
          meeting_date: '2017-03-21'
        })
        expect(response.status).to eq 403
      end
    end

    it 'works on happy path' do
      post_create(pals.shs_sofia_counselor, {
        student_id: pals.shs_freshman_mari.id,
        meeting_date: '2017-03-21'
      })
      expect(response.status).to eq 200
      json = JSON.parse(response.body)
      expect(json.keys).to eq(['id'])
      expect(CounselorMeeting.all.size).to eq(1)
      expect(CounselorMeeting.all.first.as_json(except: [:id, :updated_at, :created_at])).to eq({
        'student_id' => pals.shs_freshman_mari.id,
        'educator_id' => pals.shs_sofia_counselor.id,
        'meeting_date' => Date.parse('2017-03-21')
      })
    end
  end

  describe '#meetings_json' do
    it 'guards authorization by label' do
      (Educator.all - [pals.shs_sofia_counselor]).each do |educator|
        get_meetings_json(educator)
        expect(response.status).to eq 403
      end
    end

    it 'guards access by student' do
      [pals.healey_kindergarten_student, pals.west_eighth_ryan].each do |student|
        get_meetings_json(pals.shs_sofia_counselor, student_id: student.id)
        expect(JSON.parse(response.body)['students'].map {|s| s['id']}).not_to include(*[
          pals.healey_kindergarten_student.id,
          pals.west_eighth_ryan.id
        ])
        expect(JSON.parse(response.body)['meetings']).to eq []
      end
    end

    it 'works on happy path' do
      Timecop.freeze(pals.time_now) do
        meeting = CounselorMeeting.create!({
          student_id: pals.shs_freshman_mari.id,
          educator_id: pals.shs_sofia_counselor.id,
          meeting_date: Date.parse('2018-01-21')
        })
        get_meetings_json(pals.shs_sofia_counselor)

        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json.keys).to contain_exactly(*[
          'educators_index',
          'meetings',
          'school_year',
          'students'
        ])
        expect(json['school_year']).to eq(2017)
        expect(json['students'].map {|s| s['id']}).to contain_exactly(*[
          pals.shs_freshman_mari.id,
          pals.shs_freshman_amir.id,
          pals.shs_senior_kylo.id
        ])
        expect(json['students'].first.keys).to contain_exactly(*[
          'id',
          'counselor',
          'first_name',
          'grade',
          'has_photo',
          'house',
          'last_name',
          'program_assigned',
          'school',
          'sped_liaison',
          'sped_placement'
        ])
        expect(json['meetings']).to contain_exactly(*[{
          'id' => meeting.id,
          'student_id' => pals.shs_freshman_mari.id,
          'educator_id' => pals.shs_sofia_counselor.id,
          'meeting_date' => '2018-01-21',
          'created_at' => anything(),
          'updated_at' => anything()
        }])
      end
    end
  end

  describe '#student_feed_cards_json' do
    it 'guards authorization by label' do
      (Educator.all - [pals.shs_sofia_counselor]).each do |educator|
        get_student_feed_cards_json(educator, student_id: pals.shs_freshman_mari.id)
        expect(response.status).to eq 403
      end
    end

    it 'guards access by student' do
      [pals.healey_kindergarten_student, pals.west_eighth_ryan].each do |student|
        get_student_feed_cards_json(pals.shs_sofia_counselor, student_id: student.id)
        expect(response.status).to eq 403
      end
    end

    it 'works on happy path' do
      Timecop.freeze(pals.time_now) do
        EventNote.create!({
          educator: pals.rich_districtwide,
          student_id: pals.shs_freshman_mari.id,
          event_note_type: EventNoteType.SST,
          text: 'blah',
          recorded_at: pals.time_now - 7.days
        })
      
        get_student_feed_cards_json(pals.shs_sofia_counselor, student_id: pals.shs_freshman_mari.id)
        expect(response.status).to eq 200
        json = JSON.parse(response.body)
        expect(json['feed_cards'].size).to eq(2)
        expect(json['feed_cards'].map {|c| c['type']}).to contain_exactly(*[
          'birthday_card',
          'event_note_card'
        ])        
      end
    end
  end
end
