module LogHelper
  class Redirect
    include Singleton

    attr_reader :file

    def log_directory
      "#{Rails.root}/spec/logs"
    end

    def log_path
      "#{log_directory}/logs.txt"
    end

    def initialize
      Dir.mkdir(log_directory) unless File.exist?(log_directory)
      @file = File.new(log_path, 'w')
    end
  end
end

RSpec.configure do |config|
  config.include LogHelper
end
