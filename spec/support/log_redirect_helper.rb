module LogHelper

  def self.dir
    "#{Rails.root}/spec/logs"
  end

  def self.path
    "#{self.dir}/logs.txt"
  end

  def self.mkdir
    Dir.mkdir(self.dir) unless File.exists?(self.dir)
  end

end

RSpec.configure do |config|
  config.include LogHelper
end
