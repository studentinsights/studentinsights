namespace :report do
  desc 'Print assessment families, subjects, counts'
  task assessments: :environment do
    AssessmentsReport.new.print_report
  end
end
