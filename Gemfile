source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '~> 5.1.1'
gem 'pg'
gem 'puma'

gem 'aws-sdk', '~> 2'
gem 'devise', '~> 4.3.0'
gem 'devise_ldap_authenticatable'
gem 'administrate', '~> 0.8.1'
gem 'friendly_id', '~> 5.1.0'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 5.0.3'
gem 'net-sftp'
gem 'net-ssh'
gem 'nokogiri', '~> 1.8.1' # forcing patching version on transitive dependency
gem 'probability'
gem 'rollbar'
gem 'oj'
gem 'oj_mimic_json'
gem 'sass-rails', '~> 5.0'
gem 'secure_headers'
gem 'sprockets'
gem 'thor'
gem 'uglifier', '>= 1.3.0'
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'
gem 'selenium-webdriver'
gem 'delayed_job_active_record'
gem 'scout_apm'
gem 'immigrant'
gem 'memory_profiler'     # Used in rake task so needs to be included in production
gem 'get_process_mem'
gem 'platform-api'

group :production do
  gem 'rails_12factor'
end

group :development, :test do
  gem 'capybara'
  gem 'database_cleaner'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'launchy'
  gem 'pry' # Set a breakpoint in your ruby code by adding `binding.pry`
  gem 'rack-test'
  gem 'rspec-rails'
  gem 'shoulda-matchers'
  gem 'simplecov'
  gem 'timecop'
  gem 'rails-controller-testing'
  gem 'bourbon', '~> 4.3.2'
  gem 'descriptive-statistics'
end

group :development do
  gem 'rails-erd', require: false
  gem 'rubocop', require: false
  gem 'better_errors'
  gem 'pivotal_git_scripts'
  gem 'spring'
end
