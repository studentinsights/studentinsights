# typed: false
require 'rails_helper'

RSpec.describe CounselorMeeting, type: :model do
  let!(:pals) { TestPals.create! }

  describe 'validation' do
    it 'works for different fields' do
      expect(CounselorMeeting.create({
        educator_id: pals.uri.id,
        student_id: pals.shs_freshman_mari.id
      }).errors.details).to eq({:meeting_date=>[{:error=>:blank}]})
      expect(CounselorMeeting.create({
        meeting_date: '2008-03-21',
        student_id: pals.shs_freshman_mari.id
      }).errors.details).to eq({:educator=>[{:error=>:blank}]})
      expect(CounselorMeeting.create({
        educator_id: pals.uri.id,
        meeting_date: '2008-03-21'
      }).errors.details).to eq({:student=>[{:error=>:blank}]})
      expect(CounselorMeeting.create({
        educator_id: pals.uri.id,
        meeting_date: '2008-03-21',
        student_id: pals.shs_freshman_mari.id
      }).errors.details).to eq({})
    end
  end
end
