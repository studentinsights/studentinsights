source 'https://rubygems.org'

ruby '2.6.5'

# forced patches
# (none)

# build, deploy
gem 'bootsnap', require: false
gem 'jquery-rails'
gem 'jquery-ui-rails', '~> 6.0.1'
gem 'rails', '~> 6.0.0'
gem 'sass-rails', '~> 5.0'
gem 'sprockets'
gem 'uglifier', '>= 1.3.0'

# rails plugins or patches
gem 'administrate', '~> 0.12.0'
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

# services
gem 'aws-sdk', '~> 2'
gem 'dalli' # memcached for rack::attack
gem 'google-api-client', "~> 0.28.7"
gem 'net-ldap'
gem 'net-sftp'
gem 'net-ssh'
gem 'nokogiri', '~> 1.10.5' # https://github.com/sparklemotion/nokogiri/issues/1943
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
  gem 'bourbon', '~> 4.3.2'
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
