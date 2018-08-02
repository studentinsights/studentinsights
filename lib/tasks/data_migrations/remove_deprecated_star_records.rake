namespace :data_migration do
  desc "Remove deprecated STAR records"
  task remove_deprecated_star: :environment do
    Assessment.where(family: 'STAR').destroy_all
  end
end
