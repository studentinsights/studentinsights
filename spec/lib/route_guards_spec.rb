require 'spec_helper'

RSpec.describe 'checking authentication guards around all routes', :type => :request do
  # These should only be endpoints involved in login, everything else should have authentication
  # checks (both by routes.rb and ApplicationController).
  UNAUTHENTICATED_WHITELIST = [
    [:get, '/'],
    [:get, '/educators/sign_in'],
    [:post, '/educators/sign_in'],
    [:delete, '/educators/sign_out'],
  ]

  # We don't want noise updating this on every route change, but also want to verify
  # that this test is actually finding routes and checking them.
  MINIMUM_EXPECTED_ENDPOINTS_COUNT = 90

  # quick and dirty substitutition for routes, not semantically meaningful
  def gather_endpoints_to_check
    Rails.application.routes.routes.map do |route|
      verb = route.verb.downcase.to_sym
      example_path = route.path.spec
        .to_s.gsub('(.:format)', '')
        .gsub(/:([^\/]+)/,'SOME_PLACEHOLDER_PARAM')
        .gsub('*path', 'SOME_PLACEHOLDER_PATH')
        .gsub('*filename','SOME_PLACEHOLDER_FILENAME')
      next unless verb.present?
      [verb, example_path]
    end.compact
  end

  def endpoints_to_check
    gather_endpoints_to_check - UNAUTHENTICATED_WHITELIST
  end

  def http_request(verb, path, headers = {})
    send(verb, path, headers: { 'HTTPS' => 'on' }.merge(headers))
    response
  end

  it 'guards all endpoints when requested as HTML' do
    endpoints_to_check.each do |endpoint_to_check|
      verb, example_path = endpoint_to_check
      response = http_request(verb, example_path, 'HTTP_ACCEPT' => 'text/html')
      failure_message = "failed HTML #{verb} #{example_path} because it returned #{response.status} and #{response.body}"
      expect(response.status).to eq(302), failure_message
      expect(response.body).to eq('<html><body>You are being <a href="https://www.example.com/educators/sign_in">redirected</a>.</body></html>'), failure_message
    end
    expect(endpoints_to_check.size).to >= MINIMUM_EXPECTED_ENDPOINTS_COUNT
  end

  it 'guards all endpoints when requested as JSON' do
    endpoints_to_check.each do |endpoint_to_check|
      verb, example_path = endpoint_to_check
      response = http_request(verb, example_path, 'HTTP_ACCEPT' => 'application/json')
      failure_message = "failed JSON #{verb} #{example_path} because it returned #{response.status} and #{response.body}"
      expect(response.status).to eq(401), failure_message
      expect(response.body).to eq('{"error":"You need to sign in before continuing."}'), failure_message
    end
    expect(endpoints_to_check.size).to >= MINIMUM_EXPECTED_ENDPOINTS_COUNT
  end
end
