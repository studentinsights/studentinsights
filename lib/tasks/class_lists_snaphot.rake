namespace :class_lists do
  desc 'Capture student values for class lists at this moment in time'
  task snapshot: :environment do
    ClassListSnapshot.snapshot_all_workspaces
  end
end
