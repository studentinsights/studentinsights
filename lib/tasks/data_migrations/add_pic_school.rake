namespace :data_migration do
  desc "Add Capuano school"
  task add_pic: :environment do
    School.create(local_id: "PIC", name: "Parent Information Center")
  end
end
