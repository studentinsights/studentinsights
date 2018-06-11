namespace :import do
  desc 'Import data into your Student Insights instance'
  task run: :environment do
    options = ImportOptionsParser.new(ARGV).parsed_options

    job_options = options.merge({ attempt: 0 })
    if options[:background]
      Delayed::Job.enqueue ImportJob.new(options: job_options)
    else
      ImportTask.new(options: job_options).connect_transform_import
    end
  end
end
