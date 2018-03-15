RSpec.describe ApplicationController, :type => :controller do
  controller(ApplicationController) do
    def index
      raise Exceptions::EducatorNotAuthorized
    end
  end

  describe "handling Exceptions::EducatorNotAuthorized exceptions" do
    let!(:pals) { TestPals.create! }

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
end
