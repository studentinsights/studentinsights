class StudentVoiceSurveyUploader
  def initialize(file_text, upload_attrs, options = {})
    @file_text = file_text
    @upload_attrs = upload_attrs
    @log = options.fetch(:log, STDOUT)
    reset_counters!
  end

  def create_rows_from_text!
    file_digest = Digest::SHA256.hexdigest(@file_text)
    file_size = @file_text.size

    reset_counters!
    columns = StudentVoiceSurveyUpload.columns_for_form_v1
    streaming_csv = StreamingCsvTransformer.new(@log).transform(@file_text)
    streaming_csv.each_with_index do |row, index|
      missing_column_keys = (columns.values - row.to_h.keys)
      if missing_column_keys.size > 0
        @invalid_row_columns_count += 1
        next
      end

      student_id = Student.find_by_local_id(row[:student_lasid]).try(:id)
      if student_id.nil?
        @invalid_student_local_id_count += 1
        next
      end

      row_attrs = row.to_h.slice(columns.keys) # whitelist
      upload_attrs = @upload_attrs.slice(:file_name, :uploaded_by_educator_id)
      StudentVoiceSurveyUpload.create!(row_attrs.merge(upload_attrs).merge({
        file_digest: file_digest,
        file_size: file_size,
        student_id: student_id
      }))
      @created_records_count += 1
    end

    stats
  end

  private
  def stats
    {
      invalid_row_columns_count: @invalid_row_columns_count,
      invalid_student_local_id_count: @invalid_student_local_id_count,
      created_records_count: @created_records_count
    }
  end

  def reset_counters!
    @invalid_row_columns_count = 0
    @invalid_student_local_id_count = 0
    @created_records_count = 0
  end
end
