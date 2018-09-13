source 'https://rubygems.org'

ruby '2.5.1'

gem 'rails', '~> 5.2.0'
gem 'pg'
gem 'puma'

gem 'administrate', '~> 0.10.0'
gem 'authtrail', '~> 0.1.2'
gem 'aws-sdk', '~> 2'
gem 'delayed_job_active_record', '~> 4.1.3'
gem 'devise', '~> 4.4.0'
gem 'friendly_id', '~> 5.1.0'
gem 'get_process_mem'
gem 'immigrant'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 5.0.3'
gem 'json-diff'
gem 'memory_profiler'       # Used in rake task so needs to be included in production
gem 'net-sftp'
gem 'net-ssh'
gem 'net-ldap'
gem 'nokogiri', '~> 1.8.1'  # Forcing patching version on transitive dependency
gem 'oj'
gem 'oj_mimic_json'
gem 'openssl'
gem 'platform-api'
gem 'probability'
gem 'rollbar'
gem 'sass-rails', '~> 5.0'
gem 'scout_apm'
gem 'secure_headers'
gem 'selenium-webdriver'
gem 'sprockets'
gem 'thor'
gem 'uglifier', '>= 1.3.0'
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'

# used to seed demo data in production
gem 'factory_bot_rails'

group :development, :test do
  gem 'bourbon', '~> 4.3.2'
  gem 'capybara'
  gem 'database_cleaner'
  gem 'descriptive-statistics'
  gem 'launchy'
  gem 'pry' # Set a breakpoint in your ruby code by adding `binding.pry`
  gem 'rack-test'
  gem 'rails-controller-testing'
  gem 'rspec-rails'
  gem 'shoulda-matchers'
  gem 'simplecov'
  gem 'timecop'
  gem 'brakeman'
end

group :development do
  gem 'better_errors'
  gem 'pivotal_git_scripts'
  gem 'rails-erd', require: false
  gem 'rubocop', require: false
  gem 'spring'
end
