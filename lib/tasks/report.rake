namespace :report do
  desc 'Print assessment families, subjects, counts'
  task assessments: :environment do
    AssessmentsReport.new(STDOUT).print_report
  end

  desc 'Run data integrity check'
  task data_integrity: :environment do
    IntegrityCheck.new.check!
  end

  desc 'Query Mixpanel and print usage report'
  task mixpanel_usage: :environment do
    mailgun_url = MixpanelReport.mailgun_url_from_env(ENV)
    mixpanel_api_secret = ENV['MIXPANEL_API_SECRET']
    puts MixpanelReport.new(mixpanel_api_secret).run
  end

  desc 'Generate and email weekly Mixpanel usage report'
  task email_mixpanel_usage: :environment do
    # Heroku scheduler can only trigger daily, so this only emails
    # a report once a week.
    if Date.today.sunday?
      mailgun_url = MixpanelReport.mailgun_url_from_env(ENV)
      mixpanel_api_secret = ENV['MIXPANEL_API_SECRET']
      target_emails = ENV['USAGE_REPORT_EMAILS_LIST'].split(',')
      MixpanelReport.new(mixpanel_api_secret).run_and_email!(mailgun_url, target_emails)
    end
  end
end
