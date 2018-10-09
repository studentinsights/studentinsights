namespace :validations do
  desc 'Check all validations manually across all models and records in the database'
  task run_all_manually: :environment do
    def invalid_records(model_classes)
      invalids = []
      counter = 0
      model_classes.each do |model_class|
        model_class.all.each do |record|
          invalids << record if !record.valid?

          counter += 1
          puts "  checked: #{counter}" if counter > 0 && counter % 1000 == 0
        end
      end
      invalids
    end

    def print_invalid_records_by_model!
      puts "Eager loading models..."
      Rails.application.eager_load!
      model_classes = ApplicationRecord.descendants
      puts "Total classes: #{ApplicationRecord.descendants.size}"

      count = model_classes.map {|model_class| model_class.all.size }.sum
      puts "Total records: #{count}"

      puts "Checking each model..."
      invalids = invalid_records(model_classes)
      puts "Total invalids: #{invalids.size}"

      invalid_count_by_class = invalids.group_by(&:class).map {|key, values| [key, values.size] }
      puts "Invalids by model class: #{invalid_count_by_class.inspect}"
      puts "Invalid record ids by class..."
      invalids.group_by(&:class).each do |key, values|
        puts "  invalids: #{key}.where(id: #{values.map(&:id)})"
      end
      puts "Done."
      nil
    end

    print_invalid_records_by_model!
  end
end
