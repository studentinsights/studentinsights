# Configure sensitive parameters which will be filtered from the log file.
# This functions as a regex, not a whitelist of keys.
Rails.application.config.filter_parameters += [
  :password,

  # Filtering this one out because the `text` field in the event_notes and
  # event_note_revisions tables can contain sensitive information about
  # students that we want to keep out of logs.
  :text,

  # This is a good filter in general, but was added specifically for
  # class_lists_controller.
  :name
]
