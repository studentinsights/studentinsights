# typed: false
require "rails_helper"

RSpec.describe 'new', type: :view do
  let!(:pals) { TestPals.create! }

  it 'renders for any educator' do
    educator = Educator.all.sample
    render :template => 'educators/sessions/new.html.erb', :locals => {
      resource_name: educator
    }
    expect(rendered).to match(/Login/)
    expect(rendered).to match(/Password/)
    expect(rendered).to match(/Sign in/)
    expect(rendered).to match(/Use multifactor login/)
  end
end
