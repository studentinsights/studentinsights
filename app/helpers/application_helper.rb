module ApplicationHelper

  def format_date(date)
    date.strftime("%m/%d/%Y")
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
