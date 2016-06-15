module ApplicationHelper

  def format_date(date)
    return "" unless date.class == Date

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

end
