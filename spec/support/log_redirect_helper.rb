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

  # STDOUT
  class FakeLog
    attr_reader :msgs

    def initialize
      @msgs = []
    end

    def puts(msg)
      @msgs << msg
    end

    def output
      @msgs.join("\n")
    end
  end

  # Rails logger
  class QuietLogger
    attr_reader :msgs

    def initialize
      @msgs = []
    end

    def debug(message)
      @msgs << {type: :debug, message: message }
    end

    def info(message)
      @msgs << {type: :info, message: message }
    end

    def warn(message)
      @msgs << {type: :warn, message: message }
    end

    def error(message)
      @msgs << {type: :error, message: message }
    end
  end
end

RSpec.configure do |config|
  config.include LogHelper
end
