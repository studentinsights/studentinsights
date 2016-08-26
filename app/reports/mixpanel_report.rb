require 'date'
require 'json'

# Querys the MixPanel API for aggregate, non-personally identifiable usage data.
# Intended to be run weekly.
class MixpanelReport
  # Parse the Heroku environment variables into the URL form the Mailgun API expects
  def self.mailgun_url_from_env(env)
    api_key = env['MAILGUN_API_KEY']
    domain = env['MAILGUN_DOMAIN']
    "https://api:#{api_key}@api.mailgun.net/v3/#{domain}/messages"
  end

  def initialize(mixpanel_api_secret)
    @mixpanel_api_secret = mixpanel_api_secret
    @buffer = []
  end

  # Returns a string
  def run
    @buffer = []
    event_name = 'PAGE_VISIT'

    output 'Hello!'
    output
    output 'This is the usage report for Student Insights.'
    output 'It shows the number of visits and the number of unique users each week.'
    output 'For these reports, a week starts on Monday and ends on Sunday.'
    output
    output 'Unique users is the better number to watch, since visits will be more variable.'
    output 'The total across all schools is shown first, with individual schools after.'
    output 'Please reply to this email if you have any questions!'
    output
    output

    print_totals(event_name)
    output
    output
    output
    output

    schools_for_report.each do |school|
      output school[:name]
      print_summary_header
      output school_summary_table(event_name, school[:id])
      output
    end

    @buffer.join("\n")
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
        :subject => "Student Insights Usage Report for #{date_text}",
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

  private
  def schools_for_report
    local_ids = ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS']
    local_ids.map do |local_id|
      school = School.find_by_local_id(local_id)
      { name: school.name, id: school.id }
    end
  end

  def output(string = '')
    @buffer << string
    nil
  end

  def print_totals(event_name)
    output 'Total Student Insights usage'
    print_summary_header
    visits = extract(event_name, query_for({
      event: event_name,
      unit: 'week',
      where: where_string_with_defaults
    }))
    uniques = extract(event_name, query_for({
      event: event_name,
      type: 'unique',
      unit: 'week',
      where: where_string_with_defaults
    }))
    output zip_series(visits, uniques)
  end

  def print_summary_header
    output '---------------------------------------------------'
    output "Date\t\t\tVisits\t\tUsers"
  end

  def school_summary_table(event_name, school_id)
    visits = extract(event_name, page_visits_for_school(event_name, school_id))
    uniques = extract(event_name, unique_educators_for_school(event_name, school_id))
    zip_series(visits, uniques)
  end

  def zip_series(xs, ys)
    rows = xs.merge(ys) {|date, x, y| [x, y] }
    rows.keys.sort.map {|key| ([key] + rows[key]).join("\t\t") }
  end

  def extract(event_name, json)
    json['data']['values'][event_name]
  end

  def unique_educators_for_school(event_name, school_id)
    query_for({
      event: event_name,
      type: 'unique',
      unit: 'week',
      where: where_string_with_defaults([
        [:educator_school_id, '==', school_id]
      ])
    })
  end

  def page_visits_for_school(event_name, school_id)
    query_for({
      event: event_name,
      unit: 'week',
      where: where_string_with_defaults([
        [:deployment_key, '==', 'production'],
        [:educator_id, '!=', 12],
        [:educator_school_id, '==', school_id]
      ])
    })
  end

  def where_string_with_defaults(where_clauses = [])
    where_string(where_clauses + [
      [:deployment_key, '==', 'production'],
      [:educator_id, '!=', 12],
    ])
  end

  def where_string(where_clauses)
    where_clauses.map do |property, op, value|
      quoted_value = if value == value.to_s then "\"#{value}\"" else value end
      ["properties[\"#{property}\"]", op, quoted_value].join ' '
    end.join ' and '
  end

  def query_for(params)
    to_date = Date.today
    from_date = to_date - 35

    params_list = params.keys.map do |key|
      "-d #{key}='#{params[key]}'"
    end
    cmd = ([
      "curl https://mixpanel.com/api/2.0/segmentation",
      "-s",
      "-u #{@mixpanel_api_secret}: ",
      "-d from_date='#{from_date}' -d to_date='#{to_date}' "
    ] + params_list).join ' '
    output = `#{cmd}`
    JSON.parse(output)
  end
end