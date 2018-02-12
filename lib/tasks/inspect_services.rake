namespace :inspect_services do
  def recorded_in_ui_count(service_type)
    service_type.services.where(service_upload_id: nil).count
  end

  def recorded_in_bulk(service_type)
    service_type.services.where.not(service_upload_id: nil).count
  end

  desc 'Look at which services are being recorded in the UI vs. by bulk uploads'
  task ui_vs_upload: :environment do
    ServiceType.all.each do |service_type|
      puts service_type.name
      puts "*--------------*"
      puts "Recorded in UI:          #{recorded_in_ui_count(service_type)}"
      puts "Recorded in bulk upload: #{recorded_in_bulk(service_type)}"
      puts; puts
    end
  end
end
