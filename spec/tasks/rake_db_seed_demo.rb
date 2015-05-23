require "rails_helper"
require "rake"

describe "rake db:seed:demo" do

  before { SomervilleTeacherTool::Application.load_tasks }

  it "generates seed data without raising an error" do
    expect { Rake::Task['db:seed:demo'].invoke }.not_to raise_exception
  end
end
