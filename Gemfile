source 'https://rubygems.org'

ruby '2.6.5'

# forced patches
# gem 'nokogiri', '~> 1.10.4' # https://github.com/sparklemotion/nokogiri/issues/1915
# gem 'loofah', '~> 2.3.1' # https://github.com/flavorjones/loofah/issues/171

gem 'rails', '~> 5.2.0'
gem 'pg'
gem 'puma'
gem 'rack-attack'
gem 'ipcat'
gem 'dalli'
gem 'rotp'
gem 'twilio-ruby'
gem 'rqrcode'

# build, deploy
gem 'bootsnap', require: false
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 6.0.1'
gem 'rails', '~> 6.0.0'
gem 'sass-rails', '~> 5.0'
gem 'sprockets'
gem 'thor'
gem 'uglifier', '>= 1.3.0'

# rails plugins or patches
gem 'administrate', '~> 0.12.0'
gem 'authtrail'
gem 'bundler-audit' # dependency audits
gem 'devise', '~> 4.7.1'
gem 'factory_bot_rails' # seeding (for demo site in production)
gem 'friendly_id', '~> 5.1.0' # deprecated
gem 'immigrant'
gem 'memory_profiler' # used in rake task so needs to be included in production
gem 'oj'
gem 'oj_mimic_json'
gem 'rack-attack'
gem 'ruby_audit' # dependency audits
gem 'secure_headers'

# services
gem 'aws-sdk', '~> 2'
gem 'dalli' # memcached for rack::attack
gem 'google-api-client', "~> 0.28.7"
gem 'platform-api' # heroku, for forcibly restarting dynos
gem 'net-sftp'
gem 'net-ssh'
gem 'net-ldap'
gem 'openssl'
gem 'pg'
gem 'puma'
gem 'rollbar'
gem 'twilio-ruby'


### standalone libraries
# security
gem 'ipcat'
gem 'rbnacl'
gem 'rotp'
gem 'rqrcode'
gem 'zxcvbn-js', require: 'zxcvbn'

# generating pdfs
gem 'wicked_pdf'
gem 'wkhtmltopdf-binary'

# text processing (eg, IEP PDFs)
gem 'pdf-reader'
gem 'pragmatic_segmenter'

# other libs
gem 'json-diff' # for diff metata in class list changes
gem 'rubyzip', '~> 1.3.0'


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
  gem 'rubocop', '~> 0.75.0', require: false
  gem 'spring'
  gem 'listen'
end
