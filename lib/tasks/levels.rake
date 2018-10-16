namespace :levels do
  desc 'Capture levels for students at this moment in time'
  task snapshot: :environment do
    HistoricalLevelsSnapshot.snapshot!
  end
end