namespace :data_migration do
  desc "Add SPED as a school for importing SPED-associated educators/students"
  task add_sped_school: :environment do
    School.create(local_id: "SPED", name: "Special Education")
  end
end
