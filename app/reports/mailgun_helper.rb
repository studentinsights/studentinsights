class MailgunHelper
  # Parse the Heroku environment variables into the URL form the Mailgun API expects
  def mailgun_url_from_env(env)
    api_key = env['MAILGUN_API_KEY']
    domain = env['MAILGUN_DOMAIN']
    "https://api:#{api_key}@api.mailgun.net/v3/#{domain}/messages"
  end

  def validate!
    raise Exceptions::InvalidConfiguration unless env.has_key('MAILGUN_API_KEY')
    raise Exceptions::InvalidConfiguration unless env.has_key('MAILGUN_DOMAIN')
    nil
  end
end
