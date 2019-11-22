# Helper functions for doing an import, and matching different values in an imported row to
# the database.
class ImportMatcher
  def initialize(options = {})
    @google_email_address_mapping = options.fetch(:google_email_address_mapping, PerDistrict.new.google_email_address_mapping)

    reset_counters!
  end

  # student?
  def find_student_id(value, options = {})
    disable_metrics = options.fetch(:disable_metrics, false)
    student_local_id = value.try(:strip)
    student_id = Student.find_by_local_id(student_local_id).try(:id) unless student_local_id.nil?
    if student_id.nil?
      @invalid_rows_count += 1 unless disable_metrics
      @invalid_student_local_ids = (@invalid_student_local_ids + [student_local_id]).uniq unless disable_metrics
      return nil
    end
    student_id
  end

  # full_name_text is natural order (eg "Edgar Alan Poe")
  def find_student_id_with_exact_or_fuzzy_match(local_id_text, full_name_text)
    student_id = self.find_student_id(local_id_text, disable_metrics: true)
    return student_id if student_id.present?

    fuzzy_match = FuzzyStudentMatcher.new.match_from_full_name(full_name_text)
    return fuzzy_match[:student_id] if fuzzy_match.present?

    @invalid_rows_count += 1
    @invalid_student_local_ids = (@invalid_student_local_ids + [full_name_text]).uniq
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

  # This will usually be imprecise, use with care or check the
  # error rates.
  def find_educator_by_last_name(educator_last_name, options = {})
    disable_metrics = options.fetch(:disable_metrics, false)
    matches = Educator.where('full_name LIKE ?', "#{educator_last_name}, %")
    if matches.size != 1
      @invalid_rows_count += 1 unless disable_metrics
      @invalid_educator_last_names = (@invalid_educator_last_names + [educator_last_name]).uniq unless disable_metrics
      return nil
    end
    matches.first
  end

  def find_educator_by_login(educator_login, options = {})
    disable_metrics = options.fetch(:disable_metrics, false)
    educator = Educator.find_by_login_name(educator_login)
    if educator.nil?
      @invalid_rows_count += 1 unless disable_metrics
      @invalid_educator_logins = (@invalid_educator_logins + [educator_login]).uniq unless disable_metrics
      return nil
    end
    educator
  end

  # Try a few methods
  def find_educator_by_name_flexible(text)
    educator_from_login_name = self.find_educator_by_login(text, disable_metrics: true)
    return educator_from_login_name if educator_from_login_name.present?

    educator_from_last_name = self.find_educator_by_last_name(text)
    return educator_from_last_name if educator_from_last_name.present?

    nil
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
    time_zone_string = options.fetch(:time_zone_string, 'America/New_York')
    is_dst = DateTime.strptime(string_eastern_without_timezone, '%m/%d/%Y %k:%M:%S').in_time_zone(time_zone_string).dst?
    timezone_code = is_dst ? 'EDT' : 'EST'
    est_with_timezeone = "#{string_eastern_without_timezone} #{timezone_code}"
    DateTime.strptime(est_with_timezeone, '%m/%d/%Y %k:%M:%S %Z').new_offset(0)
  end

  def parse_human_date_text(string)
    Date.strptime(string, '%m/%d/%Y') rescue nil
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
      invalid_student_local_ids_size: @invalid_student_local_ids.size,
      invalid_educator_emails_size: @invalid_educator_emails.size,
      invalid_educator_last_names_size: @invalid_educator_last_names.size,
      invalid_educator_logins_size: @invalid_educator_logins.size,
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
    @invalid_educator_last_names = []
    @invalid_educator_logins = []
    @invalid_course_numbers = []
    @invalid_sep_oids = []
  end
end
