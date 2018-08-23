namespace :data_migration do
  desc 'Set created_at and updated_at timestamps for section join tables'
  task timestamps_for_section_join_tables: :environment do
    # See also 20180821152930 AddTimestamps migration, this is intended to
    # be run after.
    time_now = Time.now
    all_records = StudentSectionAssignment.all + EducatorSectionAssignment.all
    puts "Going to update timestamps to #{time_now} for all #{all_records.size} records..."
    all_records.each_with_index do |record, index|
      record.update!(created_at: time_now, updated_at: time_now)
      puts "Processed #{index} records." if index > 0 && index % 100 == 0
    end
    puts "Done."
  end
end
