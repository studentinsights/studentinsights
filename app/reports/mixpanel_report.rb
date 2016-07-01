require 'date'
require 'json'

# Querys the MixPanel API for aggregate, non-personally identifiable usage data.
# Intended to be run weekly.
class MixpanelReport
  def initialize(api_secret)
    @api_secret = api_secret
    @buffer = []
  end

  # Returns a string
  def run
    @buffer = []
    event_name = 'PAGE_VISIT'
    schools = [
      { :name => 'Healey', :id => 2 },
      { :name => 'West', :id => 6 },
      { :name => 'East', :id => 5 }
    ]
    schools.each do |school|
      output school[:name]
      print_summary_header
      output school_summary_table(event_name, school[:id])
      output
    end

    print_totals(event_name)
    @buffer.join("\n")
  end

  def run_and_email!(mailgun_url, target_emails)
    puts 'Running report...'
    output = run
    puts 'Done.'
    puts
    puts 'Report output:'
    puts output
    puts

    puts 'Sending emails...'
    target_emails.each do |email|
      post_data = Net::HTTP.post_form(URI.parse(mailgun_url), {
        :from => "Student Insights job <kevin.robinson.0@gmail.com>",
        :to => "Kevin Robinson <kevin.robinson.0@gmail.com>",
        :subject => "Student Insights Usage Report for #{DateTime.now.beginning_of_day}",
        :text => output
      })
      puts "email: #{email}"
      puts "code: #{post_data.code}"
      puts "body: #{post_data.body}"
      puts
    end

    puts
    puts 'Done.'
  end

  private
  def output(string)

  end

  def print_totals(event_name)
    output 'TOTAL'
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
    from_date = to_date - 28

    params_list = params.keys.map do |key|
      "-d #{key}='#{params[key]}'"
    end
    cmd = ([
      "curl https://mixpanel.com/api/2.0/segmentation",
      "-s",
      "-u #{@api_secret}: ",
      "-d from_date='#{from_date}' -d to_date='#{to_date}' "
    ] + params_list).join ' '
    output = `#{cmd}`
    JSON.parse(output)
  end
end