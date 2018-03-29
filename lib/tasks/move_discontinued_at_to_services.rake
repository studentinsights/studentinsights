namespace :services do
  desc "Move discontinued at from discontinued_services to services"
  task move_discontinued_at_to_services: :environment do
    services = Service.all
    puts "Going to update each service discontinued at"

    ActiveRecord::Base.transaction do
      services.each do |service|
        if service.discontinued_services.exists?
          service.discontinued_at = service.discontinued_services.first.discontinued_at
          service.discontinued_by_educator_id = service.discontinued_services.first.recorded_by_educator_id
          service.save!
          puts "saving service"
        end
      end
    end

    puts " All done now!"
  end
end
