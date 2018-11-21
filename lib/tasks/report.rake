namespace :report do
  desc 'Print assessment families, subjects, counts'
  task assessments: :environment do
    AssessmentsReport.new(STDOUT).print_report
  end

  desc 'Generate & email weekly usage report'
  task email_weekly_report: :environment do
    # Heroku scheduler can only trigger daily, so this only emails
    # a report once a week.
    if Date.today.sunday?
      mailgun_url = MailgunHelper.new.mailgun_url_from_env(ENV)
      target_emails = ENV['USAGE_REPORT_EMAILS_LIST'].split(',')
      WeeklyReport.new.run_and_email!(mailgun_url, target_emails)
    end
  end
end
