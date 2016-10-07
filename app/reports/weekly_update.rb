class WeeklyUpdate
  # Parse the Heroku environment variables into the URL form the Mailgun API expects
  def self.mailgun_url_from_env(env)
    api_key = env['MAILGUN_API_KEY']
    domain = env['MAILGUN_DOMAIN']
    "https://api:#{api_key}@api.mailgun.net/v3/#{domain}/messages"
  end

  def initialize
    @today = Date.today
    @reporting_period_in_days = 7
  end

  # Return a string
  def run
    'hello!'
  end

  # Prints to stdout and sends an email to each address in `target_emails`
  def run_and_email!(mailgun_url, target_emails)
    puts 'Running report...'
    report_text = run()
    puts 'Done.'
    puts
    puts 'Report output:'
    puts report_text
    puts

    puts 'Sending emails...'
    target_emails.each do |target_email|
      date_text = DateTime.now.beginning_of_day.strftime('%B %e, %Y')
      post_data = Net::HTTP.post_form(URI.parse(mailgun_url), {
        :from => "Student Insights job <kevin.robinson.0@gmail.com>",
        :to => target_email,
        :subject => "Student Insights Weekly update for educators for #{date_text}",
        :html => "<html><body><pre style='font: monospace; font-size: 12px;'>#{report_text}</pre>"
      })
      puts "to: #{target_email}"
      puts "code: #{post_data.code}"
      puts "body: #{post_data.body}"
      puts
    end

    puts
    puts 'Done.'
  end
end

