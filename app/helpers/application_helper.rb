module ApplicationHelper

  def present(object)
    klass ||= "#{object.class}Presenter".constantize
    presenter = klass.new(object)
    yield presenter if block_given?
    presenter
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
