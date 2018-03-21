require 'json'

class RawMixpanelDataDownloader

  def initialize(mixpanel_api_secret = ENV.fetch('MIXPANEL_API_SECRET'))
    @mixpanel_api_secret = mixpanel_api_secret
    @focal_time_period_start = DateTime.new(2017, 8, 28)
    @focal_time_period_end = DateTime.new(2017, 12, 24)
    @output_rows_parsed = 0
  end

  def event_data
    puts "Fetching data from Mixpanel..." unless Rails.env.test?

    cmd = ([
      "curl https://data.mixpanel.com/api/2.0/export",
      "-s",
      "-u #{@mixpanel_api_secret}: ",
      "-d from_date='#{date_to_query_string(@focal_time_period_start)}' -d to_date='#{date_to_query_string(@focal_time_period_end)}' "
    ].join(' '))

    raw_output = `#{cmd}`

    parsed_output = raw_output.split("\n").map do |json_line|
      parsed_line = JSON.parse(json_line)

      unless Rails.env.test?
        @output_rows_parsed += 1
        print "\r#{@output_rows_parsed} rows of JSON parsed..."
      end

      parsed_line
    end; puts

    return parsed_output
  end

  private

    def date_to_query_string(date)
      date.strftime("%Y-%m-%d")
    end

end
