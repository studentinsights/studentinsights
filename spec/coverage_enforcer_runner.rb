require './spec/support/coverage_enforcer.rb'

FILES_TO_ENFORCE = [
  'app/models/educator.rb',

  'app/lib/authorizer.rb',
  'app/lib/authorized_dispatcher.rb',
  'app/lib/ldap_authenticator.rb',
  'app/lib/multifactor_authenticator.rb',
  'app/lib/masquerade.rb',

  'config/initializers/ldap_authenticatable_tiny.rb',
  'lib/devise/models/ldap_authenticatable_tiny.rb',
  'lib/devise/strategies/ldap_authenticatable_tiny.rb',
  'app/controllers/educators/sessions_controller.rb',
  'app/controllers/multifactor_controller.rb'
]

enforcer = CoverageEnforcer.new(FILES_TO_ENFORCE)
coverage_shards = Dir.glob('coverage/shards/*')
merged_results = enforcer.merge_shards(coverage_shards)
enforcer.enforce!(merged_results)
