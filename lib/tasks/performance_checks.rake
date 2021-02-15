namespace :performance_checks do
  desc 'Check median and p95 response times for common or performance intensive processes'
  task boundary_check: :environment do
    PerfTestEnforcer.new.check_percentiles({percentage: 0.05})
  end
end