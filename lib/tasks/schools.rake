desc 'For syncing district.yml files to School records in production'
namespace :schools do
  task update: :environment do
    school_definitions = PerDistrict.new.school_definitions_for_import
    puts "Found #{school_definitions} school_definitions..."

    school_definitions.each do |school_definition|
      local_id = school_definition['local_id']
      puts "Checking #{local_id}..."
      school = School.find_by_local_id(local_id)

      # create
      if school.nil?
        puts "  Creating school #{local_id}..."
        school.save!
        next
      end

      # update
      school.assign_attributes(school_definition)
      if school.changed?
        puts "  Updating local_id:#{local_id}... from #{school.changed_attributes.as_json} / to #{school_definition}"
        school.save!
        next
      end

      # unchanged
    end

    puts "Done."
  end
end
