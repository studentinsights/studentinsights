source 'https://rubygems.org'

ruby '2.2.3'

gem 'rails', '4.1.4'
gem 'pg'
gem 'unicorn'

gem 'activerecord-import'
gem 'aws-sdk-core', '~> 2'
gem 'devise'
gem 'devise_ldap_authenticatable'
gem 'friendly_id', '~> 5.1.0'
gem 'handlebars_assets', '~> 0.22.0'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 5.0.3'
gem 'net-sftp'
gem 'net-ssh'
gem 'pdfkit'
gem 'probability'
gem 'rubystats'
gem 'sass-rails', '~> 4.0.3'
gem 'seedbank'
gem 'thor'
gem 'turbolinks'
gem 'uglifier', '>= 1.3.0'

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
  gem 'pry'
  gem 'rack-test'
  gem 'rspec-rails', '~> 3.0'
  gem 'shoulda-matchers'
  gem 'simplecov'
  gem 'teaspoon-jasmine'
  gem 'timecop'
end

group :development do
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'capistrano', '~> 3.4.0'
  gem 'capistrano-bundler', require: false
  gem 'capistrano-passenger', require: false
  gem 'capistrano-rails', require: false
  gem 'pivotal_git_scripts'
  gem 'rack-mini-profiler'
  gem 'rails-erd'  # to auto-generate ERD and better understand the data structure
  gem 'spring'
  gem 'squasher'
end
