# typed: true
# This is for manually importing a large spreadsheet, with historical data
# about students across a range of reading assessments.
# It outputs JSON to the console.
#
# Usage:
# file_text = <<EOD
# ...
# EOD
# educator = Educator.find_by_login_name('...')
# upload_filename = '...'
# output = HeggertyProcessor.new(educator.id, upload_filename).import(file_text);nil
  class HeggertyProcessor
    def initialize(uploaded_by_educator_id, upload_filename, options = {})
      @uploaded_by_educator_id = uploaded_by_educator_id
      @upload_filename = upload_filename

      @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
      @time_now = options.fetch(:time_now, Time.now)
      @matcher = options.fetch(:matcher, ImportMatcher.new)

      reset_counters!
    end

    def import(file_text, options = {})
      reset_counters!

      # create service upload record
      @service_upload = ServiceUpload.create!({
        uploaded_by_educator_id: @uploaded_by_educator_id,
        file_name: @upload_filename,
      })

      # parse
      rows = []
      StreamingCsvTransformer.from_text(@log, file_text).each_with_index do |row, index|
        flattened_rows = flat_map_rows(row, index)
        next if flattened_rows.nil?

        rows += flattened_rows
        @matcher.count_valid_row
      end
      log "matcher#stats: #{@matcher.stats}"
      log "HeggertyProcessor#stats: #{stats}"

      [rows, stats]
    end

    private
    def reset_counters!
      @service_upload = nil

      @invalid_student_name_count = 0
      @invalid_student_names_list = []
      @invalid_educator_count = 0
      @invalid_service_type_id_count = 0
      @invalid_date_started_count = 0
      @processed_rows_count = 0
      @valid_student_name = 0
    end

    def stats
      {
        valid_student_name: @valid_student_name,
        invalid_student_name_count: @invalid_student_name_count,
        invalid_educator_count: @invalid_educator_count,
        invalid_service_type_id_count: @invalid_service_type_id_count,
        invalid_date_started_count: @invalid_date_started_count,
        processed_rows_count: @processed_rows_count
      }
    end

    def flat_map_rows(row, index)
      # match student by name
      student_last_first = row['Student full name (Last names, first names)']
      fuzzy_match = FuzzyStudentMatcher.new.match_from_last_first(student_last_first)
      if fuzzy_match.nil?
        @invalid_student_name_count += 1
        @invalid_student_names_list << student_last_first
        return nil
      end
      @valid_student_name += 1
      student_id = fuzzy_match[:student_id]

      # match educator by email
      educator_login_name = row['Evaluator username (eg, from email address)']
      educator = educator_login_name.present? ? PerDistrict.new.find_educator_by_login_text(educator_login_name) : nil
      if educator.nil?
        @invalid_educator_count += 1
        return nil
      end

      # fields
      service_type_id = {
        1 => 601,
        5 => 602,
        9 => 603,
        13 => 604
      }[row['Heggerty start week'].to_i]
      if service_type_id.nil?
        @invalid_service_type_id_count += 1
        return nil
      end

      date_started = @matcher.parse_human_date_text(row['date_started'])
      if date_started.nil?
        @invalid_date_started_count += 1
        return nil
      end

      estimated_end_date = @matcher.parse_human_date_text(row['estimated_end_date'])
      discontinued_at = @matcher.parse_human_date_text(row['discontinued_at'])
      discontinued_by_educator_id = discontinued_at.nil? ? nil : educator.id

      # describe
      attrs = {
        service_upload: @service_upload,
        student_id: student_id,
        recorded_by_educator_id: educator.id,
        provided_by_educator_name: educator.full_name,
        service_type_id: service_type_id,
        recorded_at: @time_now,
        date_started: date_started,
        estimated_end_date: estimated_end_date,
        discontinued_at: discontinued_at,
        discontinued_by_educator_id: discontinued_by_educator_id
      }
      @processed_rows_count += 1
      [attrs]
    end

    def log(msg)
      text = if msg.class == String then msg else JSON.pretty_generate(msg) end
      @log.puts "HeggertyProcessor: #{text}"
    end
  end
