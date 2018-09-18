module ApplicationHelper
  # IE11 reports HTML1500 warnings on the console if tags are not explicitly
  # closed (like happens if you used `tag`).  Here we're rendering tags with
  # attributes and no content to be able to parse the JSON in JS.
  def json_div(options = nil)
    content_tag('div', '', options)
  end
end
