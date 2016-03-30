namespace :report do
  desc 'Print assessment families, subjects, counts'
  task assessments: :environment do
    AssessmentsReport.new.print_report
  end

  desc 'Run data integrity check'
  task data_integrity: :environment do
    IntegrityCheck.new.check!
  end
end
