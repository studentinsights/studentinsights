source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '~> 5.0.1'
gem 'pg'
gem 'puma'

gem 'activerecord-import'
gem 'devise'
gem 'devise_ldap_authenticatable'

# Draper raised errors in the upgrade to Rails 5. See:
# - https://github.com/drapergem/draper/issues/697
# - https://github.com/drapergem/draper/issues/681
gem 'draper', "3.0.0.pre1"
gem 'activemodel-serializers-xml' 

gem 'friendly_id', '~> 5.1.0'
gem 'handlebars_assets'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 5.0.3'
gem 'net-sftp'
gem 'net-ssh'
gem 'probability'
gem 'rails-sanitize-js'
gem 'react-rails' # Provides React, handles swapping between dev/production builds.  See config/initializers/assets.rb
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

# See https://github.com/thoughtbot/administrate/issues/615;
# this is pulling in https://github.com/thoughtbot/administrate/pull/673
# from the commit on master as of the data of the Rails 5 upgrade.
gem 'administrate', {
  git: 'https://github.com/thoughtbot/administrate.git',
  branch: '077f6d370b3d0eff325a3de0509aeaa21b47b632'
}

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
