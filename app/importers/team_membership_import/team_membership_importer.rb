# Load spreadsheet on athletic enrollment
class TeamMembershipImporter
  def initialize(file_text, options = {})
    @file_text = file_text
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    reset_counters!
  end

  def create_from_text!
    reset_counters!

    created_records = []
    columns_map = {
      activity_text: 'Activity',
      coach_text: 'Coach',
      school_year_text: 'School_Year'
    }
    create_streaming_csv.each_with_index do |row, index|
      student_local_id = row['ID'] # lasid
      maybe_row_attrs = process_row_or_nil(columns_map, student_local_id, row)
      next if maybe_row_attrs.nil?
      created_records << TeamMembership.create!(maybe_row_attrs)
      @created_records_count += 1
    end

    created_records
  end

  private
  def create_streaming_csv
    csv_transformer = StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
    csv_transformer.transform(@file_text)
  end

  def process_row_or_nil(columns_map, student_local_id, raw_row)
    missing_column_keys = (columns_map.values - raw_row.to_h.keys)
    if missing_column_keys.size > 0
      @invalid_row_columns_count += 1
      return nil
    end

    # whitelist attributes for the row, translate to short symbol keys
    row_attrs = {}
    columns_map.each do |record_field_name, csv_column_text|
      row_attrs[record_field_name] = raw_row[csv_column_text]
    end

    # filter out if all responses are empty
    if row_attrs.values.uniq == ['']
      @invalid_row_columns_count += 1
      return nil
    end

    # match student
    student_id = Student.find_by_local_id(student_local_id).try(:id)
    if student_id.nil?
      @invalid_student_local_id_count += 1
      @invalid_student_lodal_ids_list << student_local_id
      return nil
    end

    row_attrs.merge(student_id: student_id)
  end

  def stats
    {
      created_records_count: @created_records_count,
      invalid_row_columns_count: @invalid_row_columns_count,
      invalid_student_local_id_count: @invalid_student_local_id_count,
      invalid_student_lodal_ids_list: @invalid_student_lodal_ids_list
    }
  end

  def reset_counters!
    @created_records_count = 0
    @invalid_row_columns_count = 0
    @invalid_student_local_id_count = 0
    @invalid_student_lodal_ids_list = []
  end
end
