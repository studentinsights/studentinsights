source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '~> 4.2'
gem 'pg'
gem 'puma'

gem 'activerecord-import'
gem 'administrate', '~> 0.2.1'
gem 'devise'
gem 'devise_ldap_authenticatable'
gem 'draper', '~> 1.3'
gem 'friendly_id', '~> 5.1.0'
gem 'handlebars_assets', '~> 0.22.0'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 5.0.3'
gem 'net-sftp'
gem 'net-ssh'
gem 'probability'
gem 'rails-sanitize-js'
gem 'react-rails', '~> 1.5.0'   # Provides React, handles swapping between dev/production builds.
                                # See config/initializers/assets.rb
gem 'memory_profiler'
gem 'oj'
gem 'oj_mimic_json'
gem 'benchmark-memory'
gem 'rubystats'
gem 'sass-rails', '~> 5.0'
gem 'sprockets', '2.12.3'
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
end

group :development, :test do
  gem 'capybara'
  gem 'database_cleaner'
  gem 'factory_girl_rails'
  gem 'faker'
  gem 'launchy'
  gem 'phantomjs'
  gem 'pry'                   # Set a breakpoint in your ruby code by adding `binding.pry`
                              # See https://github.com/pry/pry
  gem 'rack-test'
  gem 'rspec-rails', '~> 3.0'
  gem 'shoulda-matchers'
  gem 'simplecov'
  gem 'teaspoon-jasmine'
  gem 'timecop'
end

group :development do
  gem 'better_errors'
  gem 'pivotal_git_scripts'
  gem 'spring'
end
