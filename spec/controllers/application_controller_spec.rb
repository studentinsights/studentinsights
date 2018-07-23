RSpec.describe ApplicationController, :type => :controller do
  let!(:pals) { TestPals.create! }

  describe "handling Exceptions::EducatorNotAuthorized exceptions" do
    controller(ApplicationController) do
      def index
        raise Exceptions::EducatorNotAuthorized
      end
    end

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

  describe "handling ActiveRecord::NotFound exceptions" do
    controller(ApplicationController) do
      def index
        raise ActiveRecord::RecordNotFound
      end
    end

    it "redirects HTML requests to home" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      get :index
      expect(response).to redirect_to('/home')
    end

    it "returns JSON for JSON requests" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :index
      expect(response.status).to eq 404
      expect(JSON.parse(response.body)).to eq({
        "error" => "not_found"
      })
    end
  end
end
