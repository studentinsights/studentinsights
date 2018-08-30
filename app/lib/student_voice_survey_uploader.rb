class StudentVoiceSurveyUploader
  def initialize(file_text, upload_attrs, options = {})
    @file_text = file_text
    @upload_attrs = upload_attrs
    @log = options.fetch(:log, STDOUT)
    reset_counters!
  end

  def create_from_text!
    reset_counters!

    student_voice_survey_upload = StudentVoiceSurveyUpload.create!({
      file_digest: Digest::SHA256.hexdigest(@file_text),
      file_size: @file_text.size,
      file_name: @upload_attrs[:file_name],
      uploaded_by_educator_id: @upload_attrs[:uploaded_by_educator_id],
      stats: stats,
      completed: false
    })

    completed_surveys = []
    columns = StudentVoiceCompletedSurvey.columns_for_form_v1
    create_streaming_csv.each_with_index do |row, index|
      maybe_row_attrs = process_row_or_nil(columns, row, index)
      next if maybe_row_attrs.nil?
      completed_surveys << StudentVoiceCompletedSurvey.create!(maybe_row_attrs.merge({
        student_voice_survey_upload: student_voice_survey_upload
      }))
      @created_records_count += 1
    end

    student_voice_survey_upload.update!({
      stats: stats,
      completed: true
    })
    student_voice_survey_upload
  end

  private
  def create_streaming_csv
    csv_transformer = StreamingCsvTransformer.new(@log, {
      csv_options: { header_converters: nil }
    })
    csv_transformer.transform(@file_text)
  end

  def process_row_or_nil(columns_map, row, index)
    missing_column_keys = (columns_map.values - row.to_h.keys)
    if missing_column_keys.size > 0
      @invalid_row_columns_count += 1
      return nil
    end

    student_id = Student.find_by_local_id('2222222222').try(:id) # Student.find_by_local_id(row[:student_lasid]).try(:id)
    if student_id.nil?
      @invalid_student_local_id_count += 1
      return nil
    end

    # whitelist
    row_attrs = {}
    columns_map.each do |record_field_name, csv_column_text|
      row_attrs[record_field_name] = row.to_h[csv_column_text]
    end
    row_attrs.merge(student_id: student_id)
  end

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
