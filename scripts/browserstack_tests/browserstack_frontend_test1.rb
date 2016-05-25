require 'rubygems'
require 'selenium-webdriver'

# Input capabilities
caps = Selenium::WebDriver::Remote::Capabilities.new
#caps["browser"] = "IE"
caps["browser"] = "Chrome"
#caps["browser_version"] = "7.0"
caps["browser_version"] = "50.0"
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

