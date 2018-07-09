# These methods are all hooks for https://github.com/collectiveidea/delayed_job
class ImportJob

  def initialize(options:)
    @options = options
  end

  def perform
    ImportTask.new(options: @options).connect_transform_import
  end

  def error(job, exception)
    extra_info =  { "hook" => "error", "job" => job.as_json(except: :log) }
    Rollbar.error('ImporterJob#error', exception, extra_info)
  end

  def failure(job)
    extra_info =  { "hook" => "failure", "job" => job.as_json(except: :log) }
    exception = StandardError.new('ImportJob#failure')
    Rollbar.error('ImporterJob#failure', exception, extra_info)
  end
end
