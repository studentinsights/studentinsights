module ApplicationHelper
  def resource_name
    :user
  end

  def resource
    @resource ||= User.new
  end

  def devise_mapping
    @devise_mapping ||= Devise.mappings[:user]
  end

  def login_field_label
    return 'Email' if PerDistrict.new.login_educator_with_email?
    return 'Username'
  end

  def login_field_type
    return :email if PerDistrict.new.login_educator_with_email?
    return :text
  end

  # IE11 reports HTML1500 warnings on the console if tags are not explicitly
  # closed (like happens if you used `tag`).  Here we're rendering tags with
  # attributes and no content to be able to parse the JSON in JS.
  def json_div(options = nil)
    content_tag('div', '', options)
  end
end
