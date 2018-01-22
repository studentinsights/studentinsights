ActiveSupport::Notifications.subscribe 'process_action.action_controller' do |*args|
  event = ActiveSupport::Notifications::Event.new *args
  MonitoringLog.create!({
    name: event.name,
    key: (event.payload[:controller].split('::') + [event.payload[:action]]).join('.'),
    json: {
      controller: event.payload[:controller],
      action: event.payload[:action],
      method: event.payload[:method],
      status: event.payload[:status],
      path: event.payload[:path],
      view_runtime: event.payload[:view_runtime],
      db_runtime: event.payload[:db_runtime],
      duration: event.duration
    }.to_json
  })
end