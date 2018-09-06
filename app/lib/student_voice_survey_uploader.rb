class StudentVoiceSurveyUploader
  def initialize(file_text, upload_attrs, options = {})
    @file_text = file_text
    @upload_attrs = upload_attrs
    @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
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
    columns = StudentVoiceCompletedSurvey.columns_for_form_v2
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

  def process_row_or_nil(columns_map, raw_row, index)
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
      @empty_survey_count += 1
      return nil
    end

    # match student
    student_id = Student.find_by_local_id(row_attrs[:student_lasid]).try(:id)
    if student_id.nil?
      @invalid_student_local_id_count += 1
      @invalid_student_lodal_ids_list << row_attrs[:student_lasid]
      return nil
    end

    row_attrs.merge(student_id: student_id)
  end

  def stats
    {
      created_records_count: @created_records_count,
      empty_survey_count: @empty_survey_count,
      invalid_row_columns_count: @invalid_row_columns_count,
      invalid_student_local_id_count: @invalid_student_local_id_count,
      invalid_student_lodal_ids_list: @invalid_student_lodal_ids_list
    }
  end

  def reset_counters!
    @created_records_count = 0
    @empty_survey_count = 0
    @invalid_row_columns_count = 0
    @invalid_student_local_id_count = 0
    @invalid_student_lodal_ids_list = []
  end
end
