class Notifier
  def initialize(options = {})
    @date = options.fetch(:date, Time.now.beginning_of_day)
  end

  def event_note_notifications(options = {})
    educators = options.fetch(:educators, Educator.all)

    # query for all in the window
    all_event_notes = EventNote.all
      .where('recorded_at >= ? ', @date.beginning_of_day)
      .where('recorded_at < ? ', @date.end_of_day)

    # Group by educator, essentially.
    # We can't just do that directly since we need to run each note through the authorization
    # rules.
    educators.flat_map do |educator|
      authorizer = Authorizer.new(educator)
      event_notes = authorizer.authorized do
        all_event_notes.select do |event_note|
          event_note.educator_id != educator.id
        end
      end

      # Limit what we reveal over email
      students_count = event_notes.map(&:student_id).uniq.size
      if students_count > 0
        [{
          link: '/home', # url_helpers.home_url,
          cancel_url: '/home', # url_helpers.home_url,
          educator_json: educator.as_json(only: [:id, :email]),
          date: @date,
          notes_count: event_notes.size,
          students_count: students_count
        }]
      else
        []
      end
    end
  end

  def send_emails!(notifications, options = {})
    log "Notifier#send_emails! for #{notifications.size} notifications..."
    notifications.each do |notification|
      status_code = send_email!({
        from: 'Student Insights <bot@studentinsights.org>',
        to: "kevin.robinson.0+#{notification[:id]}@gmail.com", #notification[:educator_json][:email],
        subject: 'Your students were mentioned in Student Insights',
        html: template.result_with_hash(notification)
      })
      log "  status_code: #{status_code}"
    end
    log "Done."
  end

  private
  def template
    filename = Rails.root.join('app', 'lib', 'notifier_email.html.erb')
    @template ||= ERB.new(filename.read)
  end

  def send_email!(params = {})
    if Rails.env.production?
      mailgun_url = MailgunHelper.mailgun_url_from_env(ENV)
      post_data = Net::HTTP.post_form(URI.parse(mailgun_url), params)
      post_data.code
    else
      IO.write(Rails.root.join('tmp', "event_note_notifications-#{params[:to].gsub(/@/, '-')}.html"), params[:html])
      200
    end
  end

  def log(msg)
    puts msg
  end

  def url_helpers
    Rails.application.routes.url_helpers
  end
end
