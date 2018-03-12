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
      get :index
      expect(response).to redirect_to '/foo'
    end

    it "returns JSON for JSON requests" do
      sign_in(pals.uri)
      request.env['HTTP_ACCEPT'] = 'application/json'
      get :index
      expect(response.code).to eq 200
      expect(response.body).to eq 'fds'
    end
  end
end