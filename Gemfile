source 'https://rubygems.org'

ruby '2.3.0'

gem 'rails', '4.1.14.1'
gem 'pg'
gem 'unicorn'

gem 'activerecord-import'
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
gem 'react-rails', '~> 1.5.0'   # Provides React, handles swapping between dev/production builds.
                                # See config/initializers/assets.rb
gem 'rubystats'
gem 'sass-rails', '~> 4.0.3'
gem 'seedbank'
gem 'thor'
gem 'turbolinks'
gem 'uglifier', '>= 1.3.0'
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'

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
