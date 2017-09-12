class ImportJob
  def perform
    load File.expand_path("#{Rails.root}/lib/tasks/import.thor", __FILE__)
    Import::Start.new.invoke_all
  end

  def max_attempts
    1
  end
end
