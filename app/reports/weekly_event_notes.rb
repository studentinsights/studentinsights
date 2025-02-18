# Weekly email sent to HomeRoom Educators reminding them to check notes in the past 7 days
# Intended to be run weekly.
class WeeklyEventNotes
    def initialize(options = {})
      @time_now = options.fetch(:time_now, Time.now)
      @reporting_period_in_days = @weeks_count * 7
      @log = options.fetch(:log, STDOUT)
  
      @buffer = []
    end
  
    # Returns a string
    def run
      @buffer = []
  
      output "Hello !"
      output
      output "This is the Weekly reminder that there are new notes. Log in to see the notes"
  
      output
      output line_break('_')
      output
      output
      output
  
      output
      output
  
      @buffer.join("\n")
    end
  
    # Prints to stdout and sends an email to each address in `target_emails`
    def run_and_email!(mailgun_url, target_emails)
      log 'Running report...'
      report_text = run()
      log 'Done.'
      log
      
        target_emails = get_homeroom_educators_with_notes()
      log "Sending #{target_emails.size} emails..."
      target_emails.each do |target_email|
        date_text = @time_now.beginning_of_day.strftime('%B %e, %Y')
        post_data = Net::HTTP.post_form(URI.parse(mailgun_url), {
          :from => "Student Insights job <kevin.robinson.0@gmail.com>",
          :to => target_email,
          :subject => "Weekly Reminder #{date_text}",
          :html => "<html><body><pre style='font: monospace; font-size: 12px;'>#{report_text}</pre>"
        })
        log "  response status: #{post_data.code}"
      end
      log 'Done.'
    end
  
    private
    def output(string = '')
      @buffer << string
      nil
    end
  
    def indent(string = '')
      @buffer << "\t#{string.split("\n").join("\n\t")}"
      nil
    end
  
    def line_break(char = '-')
      70.times.map { char }.join('')
    end
  
    def get_homeroom_educators_with_notes() 
        # Queries the database and retrieve all homeroom educators who recieved notes in the past 7 days
        educators = Educator
            .joins(:event_notes)
            .joins(:homeroom)
            .joins(:students)
            .where("students.grade IN ('KF', '1', '2', '3', '4', '5', '6', '7', '8') AND event_notes.created_at >= now() - INTERVAL '7 DAYS' ")
            .group("educators.id")
    end
  
    def log(msg = '')
      @log.puts msg
    end
  end
  