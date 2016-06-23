module LogHelper
  class Redirect
    include Singleton

    def log_directory
      "#{Rails.root}/spec/logs"
    end

    def log_path
      "#{log_directory}/logs.txt"
    end

    def mkdir
      Dir.mkdir(log_directory) unless File.exists?(log_directory)
    end

  end
end

RSpec.configure do |config|
  config.include LogHelper
end
