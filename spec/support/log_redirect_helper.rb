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

  class FakeLog
    attr_reader :msgs

    def initialize
      @msgs = []
    end

    def puts(msg)
      @msgs << msg
    end

    def flush
      # noop
    end

    def output
      @msgs.join("\n")
    end
  end
end

RSpec.configure do |config|
  config.include LogHelper
end
