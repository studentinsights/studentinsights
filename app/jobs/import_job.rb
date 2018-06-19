# These methods are all hooks for https://github.com/collectiveidea/delayed_job
class ImportJob

  def initialize(options:)
    @options = options
  end

  def perform
    ImportTask.new(@options).connect_transform_import
  end

  def max_attempts
    1
  end

  def max_run_time
    6.hours
  end

  def error(job, exception)
    extra_info =  { "hook" => "error", "job" => job.as_json(except: :log) }
    ErrorMailer.error_report(exception, extra_info).deliver_now if Rails.env.production?
  end

  def failure(job)
    extra_info =  { "hook" => "failure", "job" => job.as_json(except: :log) }
    exception = StandardError.new('ImportJob#failure')
    ErrorMailer.error_report(exception, extra_info).deliver_now if Rails.env.production?
  end
end
