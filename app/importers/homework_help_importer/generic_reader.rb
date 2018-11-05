# # Takes a CSV processes each row to join keys with Insights (eg, from say a survey).
# #
# # The shape is:
# #  1) `source_key` describes what this is
# #  2) each row references a student and and educator
# #  3) the importer might skip some rows
# #  4) there are some fields for importing (eg, LASID)
# #  5) other fields are stored as a map of field>value in `source_json`
# #
# # The semantics for data flow here are:
# #  1) rows aren't guaranteed to be unique in the source data
# #  2) in-place edits are unlikely, but will update records in-place
# class GenericReader
#   # Timestamps have differnet formats if you download a Google Form as a CSV
#   # versus if you export that same form to Sheets (and then download that).
#   GOOGLE_FORM_CSV_TIMESTAMP_FORMAT = '%Y/%m/%d %l:%M:%S %p %Z'
#   GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT = '%m/%d/%Y %k:%M:%S'

#   def initialize(file_text, options = {})
#     @file_text = file_text
#     @source_key = options[:source_key]
#     @config = options[:config]
#     @log = options.fetch(:log, Rails.env.test? ? LogHelper::Redirect.instance.file : STDOUT)
    
#   end

#   def parse_rows(&block)
#     reset_counters!

#     parsed_rows = []
#     helper = GenericImportHelper.new()
#     create_streaming_csv.each_with_index do |row, index|
#       maybe_row = block.call(row.to_h, index, self)
#       next if maybe_row.nil?

#       parsed_rows << maybe_row
#       @valid_rows_count +=1
#     end

#     {
#       stats: stats,
#       parsed_rows: parsed_rows
#     }
#   end

#   private
#   # student?
#   def find_student_id(value)
#     student_local_id = value.try(:strip)
#     student_id = Student.find_by_local_id(student_local_id).try(:id) unless student_local_id.nil?
#     if student_id.nil?
#       @invalid_rows_count += 1
#       @invalid_student_local_ids = (@invalid_student_local_ids + [student_local_id]).uniq
#       return nil
#     end
#     student_id
#   end

#   # educator? also support mapping from Google email to SIS/LDAP/Insights email
#   def find_educator_id(value)
#     google_educator_email = value.try(:strip)
#     educator_email = @google_email_address_mapping.fetch(google_educator_email, google_educator_email)
#     educator_id = Educator.find_by_email(educator_email).try(:id) unless student_local_id.nil?
#     if educator_id.nil?
#       @invalid_rows_count += 1
#       @invalid_educator_emails = (@invalid_educator_emails + [educator_email]).uniq
#       return nil
#     end
#     educator_id
#   end

#   # HS course?
#   def find_course_id(value)    
#     course_number = course_number.try(:strip).upcase
#     course_id = Course.find_by_course_number(course_number).try(:id)
#     if course_id.nil?
#       @invalid_rows_count += 1
#       @invalid_course_numbers = (@invalid_course_numbers + [course_number]).uniq
#       return nil
#     end
#     course_id
#   end


#   # parse timestamp into DateTime
#   def parse_timestamp(value)
#     DateTime.strptime(value, config[:strptime_format])
#   end

#   def create_streaming_csv
#     csv_transformer = StreamingCsvTransformer.new(@log, {
#       csv_options: { header_converters: nil }
#     })
#     csv_transformer.transform(@file_text)
#   end

#   def reset_counters!
#     @valid_rows_count = 0
#     @invalid_rows_count = 0
#     @invalid_student_local_ids = []
#     @invalid_educator_emails = []
#     @invalid_course_numbers = []
#   end

#   def stats
#     {
#       valid_rows_count: @valid_rows_count,
#       invalid_rows_count: @invalid_rows_count,
#       invalid_student_local_ids: @invalid_student_local_ids,
#       invalid_educator_emails: @invalid_educator_emails
#     }
#   end
# end
