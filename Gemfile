source 'https://rubygems.org'

ruby '2.6.5'

# build, deploy
gem 'bootsnap', require: false
gem 'rails', '~> 5.2.0'
gem 'sass-rails', '~> 5.0'
gem 'sprockets'
gem 'thor'
gem 'uglifier', '>= 1.3.0'

# security, monitoring, alerting
gem 'authtrail'
gem 'dalli' # memcached for rack::attack
gem 'devise', '~> 4.7.1'
gem 'ipcat'
gem 'openssl'
gem 'rack-attack'
gem 'rbnacl'
gem 'rollbar'
gem 'rotp'
gem 'rqrcode'
gem 'secure_headers'
gem 'zxcvbn-js', require: 'zxcvbn'

# storage or services
gem 'aws-sdk', '~> 2'
gem 'google-api-client', "~> 0.28.7"
gem 'immigrant'
gem 'net-sftp'
gem 'net-ssh'
gem 'net-ldap'
gem 'pg'
gem 'puma'
gem 'rubyzip', '~> 1.3.0'
gem 'twilio-ruby'

# admin
gem 'administrate', '~> 0.10.0'

# generating pdfs
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'

# text processing (eg, IEP PDFs)
gem 'pdf-reader'
gem 'pragmatic_segmenter'

# dependency audits
gem 'bundler-audit'
gem 'ruby_audit'

# seeding (for demo site in production)
gem 'factory_bot_rails'

# other
gem 'friendly_id', '~> 5.1.0'
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 6.0.1'
gem 'json-diff'
gem 'memory_profiler'       # Used in rake task so needs to be included in production
gem 'nokogiri', '~> 1.10.4' # https://github.com/sparklemotion/nokogiri/issues/1915
gem 'oj'
gem 'oj_mimic_json'
gem 'platform-api'
gem 'probability'



group :development, :test do
  gem 'bourbon', '~> 4.3.2'
  gem 'capybara'
  gem 'database_cleaner'
  gem 'descriptive-statistics'
  gem 'pry' # Set a breakpoint in your ruby code by adding `binding.pry`
  gem 'rack-test'
  gem 'rails-controller-testing'
  gem 'rspec-rails'
  gem 'simplecov'
  gem 'timecop'
  gem 'brakeman'
end

group :development do
  gem 'better_errors'
  gem 'pivotal_git_scripts'
  gem 'rails-erd', require: false
  gem 'rubocop', '~> 0.75.0', require: false
  gem 'spring'
  gem 'listen'
end
