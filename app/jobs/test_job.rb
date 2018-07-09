# This is for testing different failure modes.
class TestJob
  def perform
    begin
      puts 'starting...'
      (0..120).each do |i|
        sleep(1.seconds)
        puts "slept #{i} seconds..."
      end
      puts 'ending...'
    rescue SignalException => e
      puts 'rescued'
      puts e
      puts 're-raising...'
      raise e
    end
  end

  def max_attempts
    2
  end

  def max_run_time
    5.minutes
  end

  # unhandled Exception
  def error(job, exception)
    extra_info =  { "hook" => "error", "job" => job.as_json(except: :log) }
    puts "error"
    puts exception
    puts extra_info
  end

  # When the job itself has ultimately failed and can no
  # longer continue, or it encounters a DeserializationError and can't even start.
  def failure(job)
    extra_info =  { "hook" => "failure", "job" => job.as_json(except: :log) }
    exception = StandardError.new('ImportJob#failure')
    puts "failure"
    puts exception
    puts extra_info
  end
end
