namespace :inspect_services do
  def recorded_in_ui_count(service_type)
    service_type.services.where(service_upload_id: nil).count
  end

  def recorded_in_bulk(service_type)
    service_type.services.where.not(service_upload_id: nil).count
  end

  desc 'Look at which services are being recorded in the UI vs. by bulk uploads'
  task ui_vs_upload_counts: :environment do
    ServiceType.all.each do |service_type|
      puts service_type.name
      puts "*--------------*"
      puts "Recorded in UI:          #{recorded_in_ui_count(service_type)}"
      puts "Recorded in bulk upload: #{recorded_in_bulk(service_type)}"
      puts; puts
    end
  end

  desc 'See if any students have services of same type, with/without bulk upload'
  task ui_vs_upload_student: :environment do
    ServiceType.all.each do |service_type|
      bulk_upload_student_ids = service_type.services.where.not(service_upload_id: nil)
                                                     .map(&:student_id)
      recorded_ui_student_ids = service_type.services.where(service_upload_id: nil)
                                                     .map(&:student_id)

      overlap = bulk_upload_student_ids & recorded_ui_student_ids

      puts service_type.name
      puts "*--------------*"
      puts "Overlap: #{overlap}"
      puts; puts
    end
  end
end
