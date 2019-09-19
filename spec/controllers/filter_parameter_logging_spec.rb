RSpec.describe 'filter_parameter_loggin', :type => :controller do
  class GeneratedController < ApplicationController;end
  controller GeneratedController do
    def index
    end
  end

  def mock_subscribers_log!
    log = LogHelper::RailsLogger.new
    ActiveSupport::Subscriber.subscribers.each do |subscriber|
      allow(subscriber).to receive(:logger).and_return(log)
    end
    log
  end

  def random_hex
    32.times.map { rand(16).to_s(16) }.join()
  end

  def generated_params(n)
    params = {}
    n.times { params[random_hex()] = "SENSITIVE-#{random_hex()}" }
    params
  end

  def make_request(params)
    request.env['HTTPS'] = 'on'
    get :index, params: params
  end

  it 'filters all parameters passed no matter what they are called' do
    log = mock_subscribers_log!
    n = 5 + Random.new(RSpec.configuration.seed).rand(10)
    params = generated_params(n)
    expect(params.keys.size).to eq n
    make_request(params)

    expect(log.output).not_to include('SENSITIVE')
    expect(log.output.scan('[FILTERED]').count).to eq n
  end

  it 'filters objects entirely' do
    log = mock_subscribers_log!
    make_request(foo: 'SENSITIVE')

    expect(log.output).not_to include('SENSITIVE')
    expect(log.output.scan('[FILTERED]').count).to eq 1
  end

  it 'filters arrays entirely' do
    log = mock_subscribers_log!
    make_request(foo: ['SENSITIVE'])

    expect(log.output).not_to include('SENSITIVE')
    expect(log.output.scan('[FILTERED]').count).to eq 1
  end
end
