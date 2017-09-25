module ApplicationHelper

  def format_date(date)
    return "" unless date.respond_to?(:strftime)

    date.strftime("%m/%d/%Y")
  end

  def todays_date
    Time.now.in_time_zone('Eastern Time (US & Canada)').to_date
  end

  def resource_name
    :user
  end

  def resource
    @resource ||= User.new
  end

  def devise_mapping
    @devise_mapping ||= Devise.mappings[:user]
  end

  # IE11 reports HTML1500 warnings on the console if tags are not explicitly
  # closed (like happens if you used `tag`).  Here we're rendering tags with
  # attributes and no content to be able to parse the JSON in JS.
  def json_div(options = nil)
    content_tag('div', '', options)
  end
end
