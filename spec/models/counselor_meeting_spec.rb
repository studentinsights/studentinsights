require 'rails_helper'

RSpec.describe CounselorMeeting, type: :model do
  let!(:pals) { TestPals.create! }

  describe 'validations' do
    it 'work' do
      expect(CounselorMeeting.create(educator_id: pals.uri.id, student_id: pals.shs_freshman_mari.id).valid?).to eq false
      expect(CounselorMeeting.create(meeting_date: '3/21/2008', student_id: pals.shs_freshman_mari.id).valid?).to eq false
      expect(CounselorMeeting.create(educator_id: pals.uri.id, meeting_date: '3/21/2008', student_id: pals.shs_freshman_mari.id).valid?).to eq true
    end
  end
end
