RSpec.describe ApplicationController, :type => :controller do
  let!(:pals) { TestPals.create! }

  controller(ApplicationController) do
    def index
      raise Exceptions::EducatorNotAuthorized
    end
  end

  describe "handling Exceptions::EducatorNotAuthorized exceptions" do
    it "redirects HTML requests" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      get :index
      expect(response).to redirect_to('/not_authorized')
    end

    it "returns JSON for JSON requests" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :index
      expect(response.status).to eq 403
      expect(JSON.parse(response.body)).to eq({
        "error" => "unauthorized"
      })
    end
  end

  describe '#current_educator' do
    it 'returns same as the Devise method' do
      Educator.all.each do |educator|
        sign_in(educator)
        expect(controller.current_educator).to eq educator
        sign_out(educator)
      end
    end

    it 'returns the underlying Devise user for all unauthorized users' do
      (Educator.all - [pals.uri]).each do |not_authorized_educator|
        sign_in(not_authorized_educator)
        expect(controller.current_educator).to eq not_authorized_educator
        sign_out(not_authorized_educator)
      end
    end

    it 'returns the underlying Devise user when not masquerading' do
      sign_in(pals.uri)
      expect(controller.current_educator).to eq pals.uri
      controller.masquerade.set_educator_id!(pals.shs_jodi.id)
      expect(controller.current_educator).to eq pals.shs_jodi
      controller.masquerade.clear!
      expect(controller.current_educator).to eq pals.uri
    end

    it 'allows calling into the superclass Devise method with super: true, even when masquerading' do
      sign_in(pals.uri)
      (Educator.all - [pals.uri]).each do |target_educator|
        controller.masquerade.set_educator_id!(target_educator.id)
        expect(controller.current_educator).to eq target_educator
        expect(controller.current_educator(super: true)).to eq pals.uri
        controller.masquerade.clear!
      end
    end


    it 'allows returns the masquerading user when authorized and when masquerading' do
      sign_in(pals.uri)
      (Educator.all - [pals.uri]).each do |target_educator|
        controller.masquerade.set_educator_id!(target_educator.id)
        expect(controller.current_educator).to eq target_educator
        controller.masquerade.clear!
      end
    end
  end

  describe '#masquerade' do
    it 'returns an object' do
      sign_in(pals.uri)
      expect(controller.masquerade).to be_instance_of(Masquerade)
    end

    it 'passes through the right session' do
      sign_in(pals.uri)
      expect(controller.masquerade.instance_variable_get(:@session)).to eq controller.session
    end

    it 'passes through the right current_user' do
      sign_in(pals.uri)
      expect(controller.masquerade.instance_variable_get(:@underlying_current_educator_lambda).call).to eq pals.uri
    end

    it 'raises if any unauthorized user tries to masquerade as any other user' do
      (Educator.all - [pals.uri]).each do |not_authorized_educator|
        sign_in(not_authorized_educator)
        Educator.all.each do |target_educator|
          expect { controller.masquerade.set_educator_id!(target_educator.id) }.to raise_error Exceptions::EducatorNotAuthorized
        end
        sign_out(not_authorized_educator)
      end
    end
  end
end
