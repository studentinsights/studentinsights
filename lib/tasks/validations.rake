namespace :validations do
  desc 'Check all validations manually across all models and records in the database'
  task run_all_manually: :environment do
    def invalid_ids_for_class(model_class)
      invalid_ids = []
      counter = 0

      puts "Scanning #{model_class.name}..."
      puts "  total records: #{model_class.all.size}"
      model_class.all.each do |record|
        invalid_ids << record.id if !record.valid?

        counter += 1
        puts "  checked: #{counter}" if counter > 0 && counter % 1000 == 0
      end
      invalid_ids
    end

    def print_invalid_ids_by_model!(model_class)
      puts "Checking #{model_class.name} records..."
      invalid_ids = invalid_ids_for_class(model_class)
      if invalid_ids.size > 0
        puts "  >>> invalid_ids: #{model_class.name}.where(id: #{invalid_ids})"
      end
      puts "  done #{model_class.name} checks."
      invalid_ids
    end

    def print_invalid_records_for_all_models!
      total_invalid_ids_count = 0

      puts "Eager loading models..."
      Rails.application.eager_load!

      model_classes = ApplicationRecord.descendants
      puts "Total classes: #{ApplicationRecord.descendants.size}"

      count = model_classes.map {|model_class| model_class.all.size }.sum
      puts "Total records: #{count}"

      puts "Checking each model..."
      model_classes.each do |model_class|
        invalid_ids = print_invalid_ids_by_model!(model_class)
        total_invalid_ids_count += invalid_ids.size
      end
      puts "Finished checking all models."

      puts
      puts
      puts "Total invalid_ids count: #{total_invalid_ids_count}"
      puts "Done."
      nil
    end

    print_invalid_records_for_all_models!
  end
end
