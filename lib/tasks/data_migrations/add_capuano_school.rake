namespace :data_migration do
  desc "Add Capuano school"
  task add_capuano: :environment do
    School.create(local_id: "CAP", name: "Capuano Early Childhood Center")
  end
end
