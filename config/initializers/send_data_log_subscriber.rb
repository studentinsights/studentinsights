# With Zeitwerk in Rails 6, this is needed so we load the code before we monkeypatch it.
# Otherwise, this defines some code and then Rails gets loaded and it gets overwritten.
require 'action_controller/log_subscriber'

# Monkey patching to override logging the filename; we want to give users
# descriptive filenames, and that means they may have sensitive info that we
# don't want logged.
#
# see https://github.com/rails/rails/blob/master/actionpack/lib/action_controller/log_subscriber.rb#L53
module ActionController
  class LogSubscriber < ActiveSupport::LogSubscriber
    # override (monkey patch)
    def send_data(event)
      info { "Sent data [FILTERED] (#{event.duration.round(1)}ms)" }
    end
  end
end
