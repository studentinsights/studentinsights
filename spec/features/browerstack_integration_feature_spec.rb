require 'rubygems'
require 'selenium-webdriver'

# Input capabilities
caps = Selenium::WebDriver::Remote::Capabilities.new
caps['browserstack.local'] = 'true'
caps['browserstack.localIdentifier'] = ENV['BROWSERSTACK_LOCAL_IDENTIFIER']
# Add other capabilities like browser name, version and os name, version
...

driver = Selenium::WebDriver.for(:remote,
  :url => "http://alexsoble:#{ENV['BROWSERSTACK_ACCESS_KEY']}@hub-cloud.browserstack.com/wd/hub",
  :desired_capabilities => caps)
