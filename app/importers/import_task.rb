class ImportTask

  def initialize(district:,
                 school:,
                 source:,
                 test_mode:,
                 progress_bar:,
                 file_import_classes:,
                 record:)
    @district = district
    @school = school
    @source = source
    @test_mode = test_mode
    @progress_bar = progress_bar
    @file_import_classes = file_import_classes
    @record = record
  end

  def connect_transform_import
    timing_log = []

    @file_import_classes.each do |file_import_class|
      file_importer = file_import_class.new(
        school,
        file_import_class_to_client(file_import_class),
        log,
        @progress_bar
      )

      timing_data = { importer: file_importer.class.name, start_time: Time.current }

      begin
        file_importer.import
      rescue => error
        puts "🚨  🚨  🚨  🚨  🚨  Error! #{error}" unless Rails.env.test?

        extra_info =  { "importer" => file_importer.class.name }
        ErrorMailer.error_report(error, extra_info).deliver_now if Rails.env.production?
      end

      timing_data[:end_time] = Time.current
      timing_log << timing_data

      @record.update(
        importer_timing_json: timing_log.to_json,
        time_ended: DateTime.current,
      )

      @record.save!
    end
  end

  private

  def file_import_class_to_client(import_class)
    return SftpClient.for_x2 if import_class.in?(X2Importers.list)

    return SftpClient.for_star if import_class.in?(StarImporters.list)

    return nil
  end

  def log
    @test_mode ? LogHelper::Redirect.instance.file : STDOUT
  end

  def progress_bar
    @progress_bar
  end

  def school
    return @school if @school.present?

    case district
    when 'Somerville'
      [
        'HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'FC', 'CAP', 'PIC',
        'SPED', 'SHS',
      ]
    when 'New Bedford'
      [
        "010",
        "015",
        "020",
        "045",
        "040",
        "050",
        "063",
        "070",
        "075",
        "078",
        "095",
        "105",
        "115",
        "105",
        "124",
        "125",
        "130",
        "135",
        "140",
        "405",
        "410",
        "415",
        "505",
        "510",
        "515",
      ]
    else
      raise 'Unfamiliar district!'
    end
  end

end
