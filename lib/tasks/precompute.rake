namespace :precompute do
  desc 'Precompute views of daily import data for school overview page'
  task school_overview: :environment do
    PrecomputeStudentHashesJob.new.precompute_all!(Time.now)
  end
end
