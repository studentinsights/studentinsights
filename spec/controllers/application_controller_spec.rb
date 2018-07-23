RSpec.describe ApplicationController, :type => :controller do
  controller(ApplicationController) do
    def not_authorized
      raise Exceptions::EducatorNotAuthorized
    end

    def not_found
      raise ActiveRecord::NotFound
    end
  end

  describe "handling Exceptions::EducatorNotAuthorized exceptions" do
    let!(:pals) { TestPals.create! }

    it "redirects HTML requests" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      get :not_authorized
      expect(response).to redirect_to('/not_authorized')
    end

    it "returns JSON for JSON requests" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :not_authorized
      expect(response.status).to eq 403
      expect(JSON.parse(response.body)).to eq({
        "error" => "unauthorized"
      })
    end
  end

  describe "handling ActiveRecord::NotFound exceptions" do
    let!(:pals) { TestPals.create! }

    it "redirects HTML requests to home" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      get :not_found
      expect(response).to redirect_to('/home')
    end

    it "returns JSON for JSON requests" do
      sign_in(pals.uri)
      request.env['HTTPS'] = 'on'
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :not_found
      expect(response.status).to eq 404
      expect(JSON.parse(response.body)).to eq({
        "error" => "not_found"
      })
    end
  end
end
