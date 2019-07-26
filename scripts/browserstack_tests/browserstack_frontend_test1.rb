# typed: false

#This script uses browserstack.com to spin up an instance of windows
#and open an instance of Internet Explorer version 11 and then
#logs in with a trial login 'ericleschinski1'.  It then visits
#the studentinsights website and finds the username and passwords
#field to login autonomously.  Then it visits a student, takes a
#screenshot and saves the screenshots.png of the whole browser
#content area.  

#Then we can dump the image to slack for review.

require 'rubygems'
require 'selenium-webdriver'

# Input capabilities
caps = Selenium::WebDriver::Remote::Capabilities.new
caps["browser"] = "IE"
#caps["browser"] = "Chrome"
#caps["browser_version"] = "7.0"
caps["browser_version"] = "11.0"
caps["os"] = "Windows"
caps["os_version"] = "7"
caps['resolution'] = '1024x768'
caps["browserstack.debug"] = "true"
caps["name"] = "Testing Selenium 2 with Ruby on BrowserStack"

driver = Selenium::WebDriver.for(:remote,
  :url => "http://ericleschinski1:x9FUpp3zs6PXH2oMh9ez@hub.browserstack.com/wd/hub",
  :desired_capabilities => caps)
#driver.navigate.to "http://www.google.com"
#element = driver.find_element(:name, 'q')
#element.send_keys "BrowserStack"
driver.navigate.to "https://somerville-teacher-tool-demo.herokuapp.com/"
element = driver.find_element(:name, 'educator[email]')

element.send_keys "demo@example.com"
driver.save_screenshot("screenshots.png")

element = driver.find_element(:name, 'educator[password]')
element.send_keys "demo-password"
sleep(2)
element.submit

driver.navigate.to "https://somerville-teacher-tool-demo.herokuapp.com/students/5"

sleep(2)
puts driver.title
driver.save_screenshot("screenshots2.png")
driver.quit

