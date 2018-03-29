class ImportJob

  def initialize(options:)
    @options = options
  end

  def perform
    ImportTask.new(options: @options).connect_transform_import
  end

  def max_attempts
    1
  end

  def max_run_time
    6.hours
  end

end
