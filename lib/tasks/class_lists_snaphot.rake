namespace :class_lists do
  desc 'Capture student values for class lists at this moment in time'
  task snapshot: :environment do
    raise 'enabled_class_lists? is false' unless PerDistrict.new.enabled_class_lists?
    raise 'URI_ID not set' unless ENV.has_key?('URI_ID')

    educator = Educator.find(ENV['URI_ID'])
    puts ClassListSnapshot.snapshot_all_workspaces(educator)
  end
end
