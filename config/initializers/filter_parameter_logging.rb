# typed: strict
# Filter all parameters from the log file, since whitelists are hard to
# maintain accurately as you build things over time.  See also the Rollbar config.
#
# For background, some known sensitive parameters included:
# - :login_text, :password, :login_code (in the login process)
# - :text (updating notes, note revisions, searching notes)
# - :name (class_lists_controller)
Rails.application.config.filter_parameters += [/.*/]
