# Helper functions for doing an import, and matching different values in an imported row to
# the database.
class ImportMatcher
  # Timestamps have differnet formats if you download a Google Form as a CSV
  # versus if you export that same form to Sheets (and then download that).
  GOOGLE_FORM_CSV_TIMESTAMP_FORMAT = '%Y/%m/%d %l:%M:%S %p %Z'
  GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT_ASSUMING_UTC = '%m/%d/%Y %k:%M:%S'
  GOOGLE_FORM_EXPORTED_TO_GOOGLE_SHEETS_TIMESTAMP_FORMAT_WITH_TIMEZONE = '%m/%d/%Y %k:%M:%S %Z'

  def initialize(options = {})
    @strptime_format = options.fetch(:strptime_format, GOOGLE_FORM_CSV_TIMESTAMP_FORMAT)
    @google_email_address_mapping = options.fetch(:google_email_address_mapping, PerDistrict.new.google_email_address_mapping)
    reset_counters!
  end

  # student?
  def find_student_id(value)
    student_local_id = value.try(:strip)
    student_id = Student.find_by_local_id(student_local_id).try(:id) unless student_local_id.nil?
    if student_id.nil?
      @invalid_rows_count += 1
      @invalid_student_local_ids = (@invalid_student_local_ids + [student_local_id]).uniq
      return nil
    end
    student_id
  end

  # educator? also support mapping from Google email to SIS/LDAP/Insights email
  def find_educator_id(value)
    google_educator_email = value.try(:strip)
    educator_email = @google_email_address_mapping.fetch(google_educator_email, google_educator_email)
    educator_id = Educator.find_by_email(educator_email).try(:id) unless educator_email.nil?
    if educator_id.nil?
      @invalid_rows_count += 1
      @invalid_educator_emails = (@invalid_educator_emails + [educator_email]).uniq
      return nil
    end
    educator_id
  end

  # HS course?
  def find_course_id(value)
    course_number = value.try(:strip).upcase
    course_id = Course.find_by_course_number(course_number).try(:id)
    if course_id.nil?
      @invalid_rows_count += 1
      @invalid_course_numbers = (@invalid_course_numbers + [course_number]).uniq
      return nil
    end
    course_id
  end

  # ed plan by SEP oid?
  def find_ed_plan_id(value)
    sep_oid = value.try(:strip)
    ed_plan_id = EdPlan.find_by_sep_oid(sep_oid).try(:id) unless sep_oid.nil?
    if ed_plan_id.nil?
      @invalid_rows_count += 1
      @invalid_sep_oids = (@invalid_sep_oids + [sep_oid]).uniq
      return nil
    end
    ed_plan_id
  end

  # parse timestamp into DateTime
  def parse_timestamp(value)
    DateTime.strptime(value, @strptime_format)
  end

  def count_valid_row
    @valid_rows_count += 1
  end

  def count_invalid_row
    @invalid_rows_count += 1
  end

  # for debugging and testing
  def stats
    {
      valid_rows_count: @valid_rows_count,
      invalid_rows_count: @invalid_rows_count,
      invalid_student_local_ids: @invalid_student_local_ids,
      invalid_educator_emails: @invalid_educator_emails,
      invalid_course_numbers: @invalid_course_numbers,
      invalid_sep_oids: @invalid_sep_oids
    }
  end

  private
  def reset_counters!
    @valid_rows_count = 0
    @invalid_rows_count = 0
    @invalid_student_local_ids = []
    @invalid_educator_emails = []
    @invalid_course_numbers = []
    @invalid_sep_oids = []
  end
end
