# typed: true
class MailgunHelper
  # Parse the Heroku environment variables into the URL form the Mailgun API expects
  def mailgun_url_from_env(env)
    api_key = env['MAILGUN_API_KEY']
    domain = env['MAILGUN_DOMAIN']
    "https://api:#{api_key}@api.mailgun.net/v3/#{domain}/messages"
  end
end
