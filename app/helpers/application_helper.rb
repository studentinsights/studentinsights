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

  def login_field
    PerDistrict.new.educator_username_field
  end

  def login_field_type
    educator_username_field = PerDistrict.new.educator_username_field

    return 'email' if educator_username_field == :email
    return 'text'
  end

  def login_field_label
    PerDistrict.new.educator_username_field.to_s.capitalize.gsub("_", " ")
  end

  # IE11 reports HTML1500 warnings on the console if tags are not explicitly
  # closed (like happens if you used `tag`).  Here we're rendering tags with
  # attributes and no content to be able to parse the JSON in JS.
  def json_div(options = nil)
    content_tag('div', '', options)
  end
end
