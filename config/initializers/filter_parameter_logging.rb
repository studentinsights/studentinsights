# Configure sensitive parameters which will be filtered from the log file.
Rails.application.config.filter_parameters += [
  :password,
  :text, # Filtering this one out because the `text` field in the event_notes and
         # event_note_revisions tables can contain sensitive information about
         # students that we want to keep out of logs.
]
