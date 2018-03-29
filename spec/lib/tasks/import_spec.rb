require 'rails_helper'
load File.expand_path('../../../../lib/tasks/import.thor', __FILE__)

RSpec.describe Import do

  it 'loads without crashing (smoke test!)' do
    expect { Import::Start.new }.not_to raise_error
  end

end
