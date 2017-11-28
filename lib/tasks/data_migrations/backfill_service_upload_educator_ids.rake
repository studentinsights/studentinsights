namespace :data_migration do
  desc "Backfill all service upload IDs"
  task backfill_service_upload_ids: :environment do
    puts "Updating service upload records..."; puts;

    ActiveRecord::Base.transaction do
      ServiceUpload.all.each do |service_upload|
        service_upload.uploaded_by_educator_id = ENV.fetch('URI_ID')
        service_upload.save!

        print "."
      end
    end

    puts; puts "All done!"
  end
end
