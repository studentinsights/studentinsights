namespace :services do
  desc "Add estimated end date to existing services"
  task add_estimated_end_date_to_existing_services: :environment do
    services = Service.all
    puts "Going to update each estimated end date for each service"

    ActiveRecord::Base.transaction do
      services.each do |service|
        if service.discontinued_services.exists?
          service.estimated_end_date = service.discontinued_services.first.discontinued_at
          service.save
          print "saving service"
        end
      end
    end

    puts " All done now!"
  end
end
