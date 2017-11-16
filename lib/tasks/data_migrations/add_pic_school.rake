namespace :data_migration do
  desc "Add Parent Information Center school"
  task add_pic: :environment do
    School.create(local_id: "PIC", name: "Parent Information Center")
  end
end
