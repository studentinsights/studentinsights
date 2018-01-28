require 'csv'
require 'benchmark'
require 'memory_profiler'

# the first two methods are roughly similar
def profile_with_get_process_mem
  before_bytes = GetProcessMem.new.bytes
  yield
  after_bytes = GetProcessMem.new.bytes
  puts "after: #{(after_bytes/1024/1024).to_i}MB"
  puts "delta: #{((after_bytes.to_i - before_bytes.to_i)/1024/1024).to_i}MB"
end# Grabbed from https://dalibornasevic.com/posts/68-processing-large-csv-files-with-ruby

def print_memory_usage
  memory_before = `ps -o rss= -p #{Process.pid}`.to_i
  yield
  memory_after = `ps -o rss= -p #{Process.pid}`.to_i

  puts "Memory: #{((memory_after - memory_before) / 1024.0).round(2)} MB"
end

# this gives detailed information, but incurs signficant overhead
def profile_memory
  report = MemoryProfiler.report do
    yield
  end
  report.pretty_print
end

def print_time_spent
  time = Benchmark.realtime do
    yield
  end

  puts "Time: #{time.round(2)}sec"
end

namespace :benchmark do
  desc 'Benchmark measuring JSON serialization'
  task json: :environment do
    profile_memory do
      print_time_spent do
        a = []
        sas = StudentAssessment.all; (1..10).each do |i|
          a << sas.to_json
        end
      end
    end
  end
end