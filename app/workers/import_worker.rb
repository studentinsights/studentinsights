class ImportWorker
  include Sidekiq::Worker

  def perform
    load File.expand_path("#{Rails.root}/lib/tasks/import.thor", __FILE__)
    Import::Start.new.invoke
  end
end
