namespace :validations do
  desc 'Check all validations manually across all models and records in the database'
  task run_all_manually: :environment do
    # This still has lots of unnecessary queries, but could be optimized
    # further to run more frequently.  FOr the `Educator` model the `plan_504`
    # path is complicated and triggers queries, and for others uniqueness
    # validations trigger a query for every validation check, even if the
    # whole table is eagerly loaded.  Those could be removed and moved into
    # db uniqueness constraints (which are stricter anyway).
    def optimized_check_for_sections!
      model_classes = {
        Educator => [],
        Student => [:school, :ed_plans],
        Course => [],
        Section => [],
        EducatorSectionAssignment => [],
        StudentSectionAssignment => []
      }

      out = {}
      model_classes.each do |model_class, includes|
        puts "Checking #{model_class.name}..."
        relation = includes.size == 0 ? model_class.all : model_class.includes(*includes).all
        records = relation.to_a # forces eager loading
        invalids = records.select {|record, index| !record.valid? }
        puts "  invalids.size: #{invalids.size} / #{records.size}"
        out[model_class.name] = invalids
      end
      out
    end

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
