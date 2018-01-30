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
end

# Grabbed from https://dalibornasevic.com/posts/68-processing-large-csv-files-with-ruby
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
  desc 'Benchmark reading and transforming CSV files during import'
  task csv_import: :environment do
    profile_memory do
      print_time_spent do
        filename = ARGV[1]

        # read file and transform
        file_contents = File.read(filename)
        puts "#{file_contents.length} bytes"
        transformer = StreamingCsvTransformer.new
        data = transformer.transform(file_contents)

        # process each row but don't actually import it
        processed_rows_count = 0
        data.each_with_index do |row, index|
          processed_rows_count = processed_rows_count + 1
          STDOUT.write "\r processed_rows_count: #{processed_rows_count}"
          # noop
        end
        puts "#{processed_rows_count} processed_rows_count"
      end
    end
  end
end
