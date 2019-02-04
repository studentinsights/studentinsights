# Helper functions for doing an import, and matching different values in an imported row to
# the database.
class ImportMatcher
  def initialize(options = {})
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

  # full_name_text is natural order (eg "Edgar Alan Poe")
  def find_student_id_with_exact_or_fuzzy_match(local_id_text, full_name_text)
    student_id = self.find_student_id(local_id_text)
    return student_id if student_id.present?

    fuzzy_match = FuzzyStudentMatcher.new.match_from_full_name(full_name_text)
    return fuzzy_match[:student_id] if fuzzy_match.present?

    nil
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

  # Parse timestamp into UTC DateTime
  #
  # Timestamps have differnet formats if you download a Google Form as a CSV
  # versus if you export that same form to Sheets (and then download that).
  # eg, Google Forms downloaded as CSV are'%Y/%m/%d %l:%M:%S %p %Z' instead
  #
  # For values in Sheets expressed in EST but without a timezone,
  # this reads them in and converts them to the same time in a
  # UTC DateTime
  def parse_sheets_est_timestamp(string_eastern_without_timezone, options = {})
    # Parse the time as if it were UTC, then ask Rails whether it is the time of year
    # when it would be daylight savings time.  Then re-parse with the correct
    # offset so we interpret the time from Sheets correctly as EST or EDT.
    is_dst = DateTime.strptime(string_eastern_without_timezone, '%m/%d/%Y %k:%M:%S').to_time.dst?
    timezone_code = is_dst ? 'EDT' : 'EST'
    est_with_timezeone = "#{string_eastern_without_timezone} #{timezone_code}"
    DateTime.strptime(est_with_timezeone, '%m/%d/%Y %k:%M:%S %Z').new_offset(0)
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
