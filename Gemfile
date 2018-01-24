source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '~> 5.1.1'
gem 'pg'
gem 'puma'

gem 'activerecord-import'
gem 'aws-sdk', '~> 2'
gem 'devise', '~> 4.3.0'
gem 'devise_ldap_authenticatable'
gem 'activemodel-serializers-xml'
gem 'administrate', '~> 0.8.1'
gem 'friendly_id', '~> 5.1.0'
gem 'handlebars_assets'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 5.0.3'
gem 'net-sftp'
gem 'net-ssh'
gem 'nokogiri', '~> 1.8.1' # forcing patching version on transitive dependency
gem 'probability'
gem 'rollbar'
gem 'rails-erd', require: false, group: :development
gem 'rubocop', require: false
gem 'oj'
gem 'oj_mimic_json'
gem 'sass-rails', '~> 5.0'
gem 'secure_headers'
gem 'sprockets'
gem 'thor'
gem 'turbolinks'
gem 'uglifier', '>= 1.3.0'
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'
gem 'selenium-webdriver'
gem 'delayed_job_active_record'
gem 'scout_apm'
gem 'immigrant'

#code for browserstack api usage and storing the png to slack:
#gem 'slack-ruby-client'
#gem 'dotenv'
#gem 'picky'

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
end

group :development do
  gem 'better_errors'
  gem 'pivotal_git_scripts'
  gem 'spring'
end
