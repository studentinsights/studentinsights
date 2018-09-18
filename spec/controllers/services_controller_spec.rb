require 'rails_helper'

describe ServicesController, :type => :controller do
  def make_request(service_id)
    request.env['HTTPS'] = 'on'
    delete :destroy, params: { id: service_id }
  end

  def create_service(student, educator)
    FactoryBot.create(:service, {
      student: student,
      recorded_by_educator: educator,
      provided_by_educator_name: 'Hadjihabib, Amir'
    })
  end

  describe '#destroy when not signed in' do
    let(:student) { FactoryBot.create(:student) }
    let(:homeroom) { student.homeroom }
    let(:educator) { FactoryBot.create(:educator) }
    let(:service) { create_service(student, educator) }

    it 'redirects' do
      make_request(service.id)
      expect(response.status).to eq 302
      expect(response).to redirect_to(new_educator_session_path)
    end
  end

  describe '#destroy when unauthorized for student' do
    let(:student) { FactoryBot.create(:student) }
    let(:homeroom) { student.homeroom }
    let(:educator) { FactoryBot.create(:educator) }
    let(:service) { create_service(student, educator) }
    before { sign_in(educator) }

    it 'redirects' do
      make_request(service.id)
      expect(response.status).to eq 302
      expect(response).to redirect_to(not_authorized_path)
    end
  end

  describe '#destroy when authorized' do
    let(:school) { FactoryBot.create(:school) }
    let(:student) { FactoryBot.create(:student, school: school) }
    let(:homeroom) { student.homeroom }
    let(:educator) { FactoryBot.create(:educator, schoolwide_access: true, school: school) }
    let(:service) { create_service(student, educator) }
    before { sign_in(educator) }

    it 'records that the service was discontinued' do
      make_request(service.id)
      expect(response.status).to eq 200
      expect(service.reload.discontinued?).to eq true
    end
  end
end
