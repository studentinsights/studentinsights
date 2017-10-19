# ---- Student Insights ----
require 'simplecov'
SimpleCov.start
# --- end Student Insights

# This file is copied to spec/ when you run 'rails generate rspec:install'
ENV['RAILS_ENV'] ||= 'test'
ENV['TZ'] ||= 'America/New_York'

require File.expand_path('../../config/environment', __FILE__)
# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?
require 'spec_helper'
require 'rspec/rails'

Dir[Rails.root.join('spec/support/**/*.rb')].each { |f| require f }

ActiveRecord::Migration.maintain_test_schema!

Capybara.default_driver = :sauce_driver

RSpec.configure do |config|
  config.fixture_path = "#{::Rails.root}/spec/fixtures"

  config.use_transactional_fixtures = true

  config.infer_spec_type_from_file_location!

  config.filter_rails_from_backtrace!

  # ---- Student Insights additions ----
  # Use DatabaseCleaner
  require "#{Rails.root}/db/seeds/database_constants"
  config.before(:suite) do
    DatabaseCleaner.strategy = :transaction
    DatabaseCleaner.clean_with(:truncation)
    DatabaseConstants.new.seed!
  end

  # Devise helpers for controller tests (eg., `sign_in`)
  config.include Devise::Test::ControllerHelpers, type: :controller

  # Register shoulda-matchers manually in Rails 5
  # See https://github.com/thoughtbot/shoulda-matchers/issues/951
  config.include(Shoulda::Matchers::ActiveModel, type: :model)
  config.include(Shoulda::Matchers::ActiveRecord, type: :model)
  Shoulda::Matchers.configure do |shoulda_config|
    shoulda_config.integrate do |with|
      with.test_framework :rspec
    end
  end
end
