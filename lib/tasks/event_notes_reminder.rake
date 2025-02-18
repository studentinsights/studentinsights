namespace :event_notes_reminder do
   
    desc 'Generate & email homeroom teachers of any new notes'
    task email_weekly_report: :environment do
      if Date.today.sunday? || ENV['FORCE_EMAIL_WEEKLY_REPORT']
        mailgun_url = MailgunHelper.new.mailgun_url_from_env(ENV)
        WeeklyEventNotes.new.run_and_email!(mailgun_url, [])
      end
    end
  end