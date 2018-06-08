namespace :report do
  desc 'Print assessment families, subjects, counts'
  task assessments: :environment do
    AssessmentsReport.new(STDOUT).print_report
  end

  desc 'Run data integrity check'
  task data_integrity: :environment do
    IntegrityCheck.new.check!
  end

  desc 'Generate & email weekly Mixpanel usage report'
  task email_mixpanel_usage: :environment do
    # Heroku scheduler can only trigger daily, so this only emails
    # a report once a week.
    if Date.today.sunday?
      mailgun_url = MailgunHelper.new.mailgun_url_from_env(ENV)
      mixpanel_api_secret = ENV['MIXPANEL_API_SECRET']
      target_emails = ENV['USAGE_REPORT_EMAILS_LIST'].split(',')
      MixpanelReport.new(mixpanel_api_secret).run_and_email!(mailgun_url, target_emails)
    end
  end

  desc 'Print usage report from Mixpanel (for debugging purposes)'
  task mixpanel_usage: :environment do
    mixpanel_api_secret = ENV['MIXPANEL_API_SECRET']
    puts MixpanelReport.new(mixpanel_api_secret).run
  end
end
