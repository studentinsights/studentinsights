require 'date'
require 'json'

# Querys the MixPanel API for aggregate, non-personally identifiable usage data.
# Intended to be run weekly.
class MixpanelReport
  def initialize(mixpanel_api_secret)
    @mixpanel_api_secret = mixpanel_api_secret
    @today = Date.today
    @reporting_period_in_days = 14
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
    output 'It also shows the number of notes created in Student Insights, and the number '
    output 'of unique users creating them each week.'
    output 'For these reports, a week starts on Monday and ends on Sunday.'
    output
    output 'Unique users is the better number to watch, since visits and counts will be more variable.'
    output 'The total across all schools is shown first, with individual schools after.'
    output 'Please reply to this email if you have any questions!'
    output

    print_totals(event_name)
    output
    print_notes_header
    print_student_insights_data_for_school(nil) # all schools
    output
    output
    output
    output

    schools_for_report.each do |school|
      output school[:name]
      print_summary_header
      output school_summary_table(event_name, school[:id])
      print_student_insights_data_for_school(school[:id])
      output
      output
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
    local_ids = ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS']
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

  def print_notes_header
    output '---------------------------------------------------'
    output "Date\t\t\tNotes\t\tUsers"
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
      where: where_string_with_defaults(where_no_developers + [
        [:deployment_key, '==', 'production'],
        [:educator_school_id, '==', school_id]
      ])
    })
  end

  def where_string_with_defaults(where_clauses = [])
    where_string(where_clauses + [
      [:deployment_key, '==', 'production'],
    ])
  end

  # Filter out developer users
  def where_no_developers
    [[:educator_id, '!=', 12],
     [:educator_id, '!=', 1054]]
  end

  def where_string(where_clauses)
    where_clauses.map do |property, op, value|
      quoted_value = if value == value.to_s then "\"#{value}\"" else value end
      ["properties[\"#{property}\"]", op, quoted_value].join ' '
    end.join ' and '
  end

  def query_for(params)
    to_date = @today
    from_date = Date.today - @reporting_period_in_days

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

  # Example:
  # ---------------------------------------------------
  # Date      Notes   Users
  # 2016-08-22    1   1
  # 2016-08-29    1   1
  # 2016-09-05    18    3
  # 2016-09-12    22    3
  # 2016-09-19    14    3
  # 2016-09-26    25    3
  #
  def print_student_insights_data_for_school(school_id = nil)
    print_notes_header

    # Allow querying for a school or all schools
    where_school = if school_id then {:students => { school_id: school_id }} else {} end
    event_notes = EventNote
      .joins(:student)
      .where(where_school)
      .where('recorded_at > ?', @today - @reporting_period_in_days.days)

    # Group by week
    notes_per_week = event_notes.group_by {|event_note| event_note.recorded_at.to_date.beginning_of_week }
    (0..@reporting_period_in_days).each do |days_back|
      monday = (@today - days_back.days).beginning_of_week
      notes_per_week[monday] = [] unless notes_per_week.has_key?(monday)
    end

    # Print each line
    notes_per_week.sort.each do |monday, weekly_event_notes|
      educators_count = weekly_event_notes.map(&:educator_id).uniq.size
      output "#{monday.strftime('%Y-%m-%d')}\t\t#{weekly_event_notes.size}\t\t#{educators_count}"
    end
  end
end
