class RawMixpanelDataDownloader

  def initialize(mixpanel_api_secret = ENV.fetch('MIXPANEL_API_SECRET'))
    @mixpanel_api_secret = mixpanel_api_secret
  end

  def pageview_counts
    puts "Fetching data from Mixpanel..." unless Rails.env.test?

    cmd = ([
      "curl https://data.mixpanel.com/api/2.0/export",
      "-s",
      "-u #{@mixpanel_api_secret}: ",
      "-d from_date='#{date_to_query_string(@focal_time_period_start)}' -d to_date='#{date_to_query_string(@focal_time_period_end)}' "
    ].join(' '))

    output = `#{cmd}`

    JSON.parse(output)
  end


end
