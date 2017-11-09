namespace :services do
  desc "Add estimated end date to existing services"
  task add_estimated_end_date_to_existing_services: :environment do
    services = Service.all
    puts "Going to update each estimated end date for each service"

    ActiveRecord::Base.transaction do
      services.each do |service|
        service.estimated_end_date = service.discontinued_at
        service.save
        puts "saving service"
      end
    end

    puts " All done now!"
  end
end
