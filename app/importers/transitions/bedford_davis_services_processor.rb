# Usage:
# file_text = <<EOD
# ...
# EOD
# recorded_by_educator = Educator.find_by_login_name('...')
# importer = BedfordDavisServicesProcessor.new(recorded_by_educator)
# rows = importer.dry_run(file_text);nil
class BedfordDavisServicesProcessor
  def initialize(recorded_by_educator, options = {})
    @recorded_by_educator = recorded_by_educator
    @form_url = form_url

    @time_now = options.fetch(:time_now, Time.now)
    @school_year = options.fetch(:school_year, SchoolYear.to_school_year(@time_now))
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    @matcher = ImportMatcher.new
    @processor = GenericSurveyProcessor.new(log: @log) do |row|
      process_row_or_nil(row)
    end
  end

  def dry_run(file_text)
    @processor.dry_run(file_text)
  end

  def stats
    {
      importer: @matcher.stats,
      processor: @processor.stats
    }
  end

  private
  # Map `row` into `Service` attributes
  def process_row_or_nil(row)
    # match student by id
    student_id = @matcher.find_student_id(row['LASID'])
    return nil if student_id.nil?

    # timestamp, just used import time since it's not in the sheet
    form_timestamp = @time_now

    # look for service names, but also accept a mapping to work around
    # typo or naming bugs in forms
    found_service_type_names = find_service_type_names(row)

    # time range is coarse, whole school year
    date_started = SchoolYear.first_day_of_school_for_year(@school_year)
    discontinued_at = SchoolYear.last_day_of_school_for_year(@school_year)
    found_service_type_names.map do |service_type_name|
      service_type = ServiceType.find_by(name: service_type_name)
      {
        student_id: student_id,
        recorded_by_educator_id: @recorded_by_educator.id,
        service_type_id: service_type.id,
        recorded_at: form_timestamp,
        date_started: date_started,
        estimated_end_date: discontinued_at,
        discontinued_at: discontinued_at,
        discontinued_by_educator_id: @recorded_by_educator.id,
        provided_by_educator_name: nil,
        service_upload_id: nil
      }
    end
  end

  def find_service_type_names(row)
    found_service_type_names = []

    service_name_mapping = {
      'Soc.Emo. Check in w/ counselor' => 'Soc.emo check in',
      'Soc. Emo. Small group' => 'Social Group',
      'Soc. Emo. individual counseling' => 'Individual Counseling',
      'LLI' => 'LLI Reading Instruction',
      'Reading Intervention (w/ specialist)' => 'Reading intervention, with specialist',
      'Math Intervention (w/ consult from SD)' => 'Math Intervention'
    }
    service_name_mapping.keys.each do |service_type_name, column_name|
      if (row[column_name].upcase == 'TRUE')
        found_service_type_names << service_type_name
      end
    end
    ServiceType.all.pluck(:name).each do |service_type_name|
      if (row[column_name].upcase == 'TRUE')
        found_service_type_names << service_type_name
      end
    end

    found_service_type_names.uniq.sort
  end
end
