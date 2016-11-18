class ConsoleOutputWorker
  include Sidekiq::Worker

  def perform
    puts "I love to work!"
  end
end
