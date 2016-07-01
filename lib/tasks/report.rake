namespace :report do
  desc 'Print assessment families, subjects, counts'
  task assessments: :environment do
    AssessmentsReport.new(STDOUT).print_report
  end

  desc 'Run data integrity check'
  task data_integrity: :environment do
    IntegrityCheck.new.check!
  end

  desc 'Query Mixpanel and email usage reports'
  task mixpanel_usage: :environment do
    mailgun_url = ENV['MAILGUN_URL']
    api_secret = ENV['API_SECRET']

    MixpanelReport.new(api_secret).run_and_email!(mailgun_url, [
      'kevin.robinson.0@gmail.com',
      'asoble@gmail.com',
      'really.eli@gmail.com'
    ])
  end
end
