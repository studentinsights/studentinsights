source 'https://rubygems.org'

ruby '2.6.6'

# forced patches
# (none)

# build, deploy
gem 'bootsnap', require: false
gem 'jquery-rails', '~> 4.3.5'
gem 'jquery-ui-rails', '~> 6.0.1'
gem 'rails', '6.0.3.7'
gem 'sprockets'
gem 'thor'
gem 'uglifier', '>= 1.3.0'

# rails plugins or patches
gem 'administrate', '~> 0.16.0'
gem 'authtrail'
gem 'devise', '~> 4.7.1'
gem 'factory_bot_rails' # seeding (for demo site in production)
gem 'friendly_id', '~> 5.1.0' # deprecated
gem 'immigrant'
gem 'memory_profiler' # used in rake task so needs to be included in production
gem 'oj'
gem 'oj_mimic_json'
gem 'rack-attack'
gem 'secure_headers'
gem 'barnes' # heroku language metrics for ruby

# services
gem 'aws-sdk-s3', '~> 1'
gem 'dalli' # memcached for rack::attack
gem 'google-api-client', "~> 0.28.7"
gem 'net-ldap'
gem 'net-sftp'
gem 'net-ssh'
gem 'nokogiri', '~> 1.11.1' # https://github.com/sparklemotion/nokogiri/issues/1943
gem 'openssl'
gem 'pg'
gem 'puma', '~> 4.3.5'
gem 'rollbar'
gem 'twilio-ruby'

### standalone libraries
# security
gem 'ipcat'
gem 'rbnacl', '~> 7.1.1'
gem 'rotp'
gem 'rqrcode'
gem 'zxcvbn-js', require: 'zxcvbn'

# generating pdfs
# See https://github.com/zakird/wkhtmltopdf_binary_gem/issues/55#issuecomment-552930066
# Driven by https://help.heroku.com/KUFMEES1/my-slug-size-is-too-large-how-can-i-make-it-smaller
gem 'wkhtmltopdf-binary', :git => 'https://github.com/studentinsights/wkhtmltopdf_binary_gem.git'
gem 'wicked_pdf'

# text processing (eg, IEP PDFs)
gem 'pdf-reader'
gem 'pragmatic_segmenter'

# other libs
gem 'json-diff' # for diff metata in class list changes
gem 'rubyzip', '~> 1.3.0',  require: 'zip'

# tools used in build (eg, static analysis, dependency audits)
group :development do
  gem 'brakeman'
  gem 'bundler-audit'
  gem 'rails_best_practices'
  gem 'ruby_audit'
  gem 'rubocop', '~> 0.75.0', require: false
end

# local development or test-only tools
group :development, :test do
  gem 'better_errors'
  gem 'capybara'
  gem 'database_cleaner'
  gem 'listen'
  gem 'pry' # Set a breakpoint in your ruby code by adding `binding.pry`
  gem 'rack-test'
  gem 'rails-controller-testing'
  gem 'rspec-rails', '~> 4.0.0.beta3'
  gem 'simplecov'
  gem 'spring'
  gem 'timecop'
end
