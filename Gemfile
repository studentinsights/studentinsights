source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '~> 5.1.1'
gem 'pg'
gem 'puma'

gem 'activerecord-import'
gem 'aws-sdk', '~> 2'
gem 'browserify-rails'
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
gem 'probability'
gem 'rails-sanitize-js'
gem 'react-rails' # Provides React, handles swapping between dev/production builds.  See config/initializers/assets.rb
gem 'rubocop', require: false
gem 'memory_profiler'
gem 'oj'
gem 'oj_mimic_json'
gem 'benchmark-memory'
gem 'rubystats'
gem 'sass-rails', '~> 5.0'
gem 'sprockets'
gem 'thor'
gem 'turbolinks'
gem 'uglifier', '>= 1.3.0'
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'
gem 'selenium-webdriver'
gem 'delayed_job_active_record'
gem 'scout_apm'

#code for browserstack api usage and storing the png to slack:
#gem 'slack-ruby-client'
#gem 'dotenv'
#gem 'picky'

group :production do
  gem 'rails_12factor'
  gem 'skylight'
end

group :development, :test do
  gem 'capybara'
  gem 'database_cleaner'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'launchy'
  gem 'phantomjs'
  gem 'pry' # Set a breakpoint in your ruby code by adding `binding.pry`
  gem 'rack-test'
  gem 'rspec-rails'
  gem 'shoulda-matchers'
  gem 'simplecov'
  gem 'teaspoon-jasmine'
  gem 'timecop'
  gem 'rails-controller-testing'
  gem 'coffee-rails'
  gem 'bourbon', '~> 4.3.2'
end

group :development do
  gem 'better_errors'
  gem 'pivotal_git_scripts'
  gem 'spring'
end
