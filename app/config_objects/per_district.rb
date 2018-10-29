# Server code that's different per-district.  Centralize here
# whereever possible rather than leaking out to different places in
# the codebase.
#
# If this gets too big we can refactor :)
class PerDistrict
  SOMERVILLE = 'somerville'
  NEW_BEDFORD = 'new_bedford'
  BEDFORD = 'bedford'
  DEMO = 'demo'

  VALID_DISTRICT_KEYS = [
    NEW_BEDFORD,
    SOMERVILLE,
    BEDFORD,
    DEMO
  ]

  def initialize(options = {})
    @district_key = options[:district_key] || ENV['DISTRICT_KEY'] || nil
    raise_not_handled! unless VALID_DISTRICT_KEYS.include?(@district_key)
  end

  def district_key
    @district_key
  end

  # User-facing text
  def district_name
    ENV['DISTRICT_NAME']
  end

  def canonical_domain
    ENV['CANONICAL_DOMAIN']
  end

  def school_definitions_for_import
    yaml.fetch('school_definitions_for_import')
  end

  def try_sftp_filename(key, fallback = nil)
    yaml.fetch('sftp_filenames', {}).fetch(key, fallback)
  end

  def try_star_filename(key, fallback = nil)
    yaml.fetch('star_filenames', {}).fetch(key, fallback)
  end

  def valid_plan_504_values
    if @district_key == SOMERVILLE || @district_key == DEMO
      [nil, "Not 504", "504", "NotIn504", "Active"]
    elsif @district_key == NEW_BEDFORD
      [nil, "NotIn504", "Active", "Exited"]
    elsif @district_key == BEDFORD
      [nil, "Active", "Exited"]
    end
  end

  # Returns nil if strict parsing fails
  def parse_date_during_import(text)
    if @district_key == SOMERVILLE || @district_key == NEW_BEDFORD
      Date.strptime(text, '%Y-%m-%d') rescue nil
    elsif @district_key == BEDFORD
      Date.strptime(text, '%m/%d/%Y') rescue nil
    else
      raise_not_handled!
    end
  end

  def enabled_class_lists?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_CLASS_LISTS')
    else
      false
    end
  end

  def enabled_student_voice_survey_uploads?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_STUDENT_VOICE_SURVEYS_UPLOADS')
    else
      false
    end
  end

  def student_voice_survey_form_url
    return nil unless enabled_student_voice_survey_uploads?
    ENV.fetch('STUDENT_VOICE_SURVEY_FORM_URL', nil)
  end

  def include_incident_cards?
    EnvironmentVariable.is_true('FEED_INCLUDE_INCIDENT_CARDS') || false
  end

  def high_school_enabled?
    @district_key == SOMERVILLE
  end

  def enabled_high_school_levels?
    @district_key == SOMERVILLE || @district_key == DEMO
  end

  # If this is enabled, filter students on the home page feed
  # based on a mapping of the `counselor` field on the student and a specific
  # `Educator`.  It may be individually feature switched as well.
  def enable_counselor_based_feed?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_COUNSELOR_BASED_FEED')
    else
      false
    end
  end

  # Controls feed filter based on ELL status
  def enable_ell_based_feed?
    EnvironmentVariable.is_true('ENABLE_ELL_BASED_FEED')
  end

  # If this is enabled, filter students on the home page feed
  # based on a mapping of the `house` field on the student and a specific
  # `Educator`.  It may be individually feature switched as well.
  def enable_housemaster_based_feed?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_HOUSEMASTER_BASED_FEED')
    else
      false
    end
  end

  # For filtering the feed by students in sections
  def enable_section_based_feed?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_SECTION_BASED_FEED')
    else
      false
    end
  end

  # In the import process, we typically only get usernames
  # as the `login_name`, and emails are the same but with a domain
  # suffix.  But for Bedford, emails are distinct and imported separately
  # from `login_name`.
  def email_from_educator_import_row(row)
    if @district_key == BEDFORD
      row[:email]
    elsif @district_key == SOMERVILLE
      row[:login_name] + '@k12.somerville.ma.us'
    elsif @district_key == NEW_BEDFORD
      row[:login_name] + '@newbedfordschools.org'
    elsif @district_key == DEMO
      row[:login_name] + '@demo.studentinsights.org'
    else
      raise_not_handled!
    end
  end

  # Sometimes we want to be able to import specific educators, even
  # if they aren't in the specific set of schools we import.
  def educators_importer_login_name_whitelist
    ENV.fetch('EDUCATORS_IMPORTER_LOGIN_NAME_WHITELIST', '').split(',')
  end

  # Users in Bedford type in just their login, others
  # use full email addresses.
  def find_educator_by_login_text(login_text)
    cleaned_login_text = login_text.downcase.strip
    if @district_key == BEDFORD
      Educator.find_by_login_name(cleaned_login_text)
    elsif @district_key == SOMERVILLE
      Educator.find_by_email(cleaned_login_text)
    elsif @district_key == NEW_BEDFORD
      Educator.find_by_email(cleaned_login_text)
    elsif @district_key == DEMO
      Educator.find_by_email(cleaned_login_text)
    else
      raise_not_handled!
    end
  end

  # Bedford LDAP server uses an email address format, but this is different
  # than the email addresses that educators actually use day-to-day.
  def ldap_login_for_educator(educator)
    if @district_key == BEDFORD
      "#{educator.login_name.downcase}@bedford.k12.ma.us"
    elsif @district_key == SOMERVILLE
      educator.email
    elsif @district_key == NEW_BEDFORD
      educator.email
    elsif @district_key == DEMO
      educator.email # only used for MockLDAP in dev/test
    else
      raise_not_handled!
    end
  end

  # This is used to mock an LDAP server for local development, test and for the demo site.
  # The behavior here is different by districts.
  def find_educator_for_mock_ldap_login(ldap_login)
    raise_not_handled! unless MockLDAP.should_use?

    if @district_key == BEDFORD
      login_name = ldap_login.split('@').first
      Educator.find_by_login_name(login_name)
    elsif @district_key == SOMERVILLE
      Educator.find_by_email(ldap_login)
    elsif @district_key == NEW_BEDFORD
      Educator.find_by_email(ldap_login)
    elsif @district_key == DEMO
      Educator.find_by_email(ldap_login)
    else
      raise_not_handled!
    end
  end

  def import_detailed_attendance_fields?
    return true if @district_key == SOMERVILLE
    return true if @district_key == BEDFORD
    return false if @district_key == NEW_BEDFORD

    raise 'import_detailed_attendance_fields? not supported for DEMO' if @district_key == DEMO

    raise_not_handled!  # Importing attendance not handled yet for BEDFORD
  end

  # eg, absence, tardy, discipline columns
  def is_attendance_import_value_truthy?(value)
    if @district_key == SOMERVILLE
      value.to_i == 1
    elsif @district_key == NEW_BEDFORD
      value.to_i == 1
    elsif @district_key == BEDFORD
      value.downcase == 'true'
    else
      raise_not_handled!
    end
  end

  # If a student withdraws, the export code may express this by setting a
  # different value for `enrollment_status` or by just not including that
  # student in the export anymore.
  def does_students_export_include_rows_for_inactive_students?
    if @district_key == SOMERVILLE
      true
    elsif @district_key == BEDFORD
      false
    elsif @district_key == NEW_BEDFORD
      false
    else
      raise_not_handled!
    end
  end

  def import_student_house?
    return true if @district_key == SOMERVILLE # SHS house
    return true if @district_key == BEDFORD # MS house
    return true if @district_key == DEMO
    false
  end

  def import_student_counselor?
    return true if @district_key == SOMERVILLE
    return true if @district_key == BEDFORD
    return true if @district_key == DEMO
    false
  end

  def import_student_sped_liaison?
    return true if @district_key == SOMERVILLE
    return true if @district_key == BEDFORD
    return true if @district_key == DEMO
    false
  end

  def import_student_ell_dates?
    return true if @district_key == SOMERVILLE
    return true if @district_key == DEMO
    false
  end

  def import_student_photos?
    @district_key == SOMERVILLE
  end

  def import_dibels?
    @district_key == SOMERVILLE
  end

  def filenames_for_iep_pdf_zips
    if @district_key == SOMERVILLE
      try_sftp_filename('FILENAMES_FOR_IEP_PDF_ZIPS', [])
    else
      []
    end
  end

  # In the import process, NB uses 0-000 as a special code in the staff CSV to indicate "no homeroom"
  def is_nil_homeroom_name?(homeroom_name)
    if @district_key == NEW_BEDFORD
      homeroom_name == '0-000'
    else
      false
    end
  end

  def is_research_matters_analysis_supported?
    @district_key == SOMERVILLE
  end

  # See also language.js
  def is_student_english_learner_now?(student)
    if @district_key == SOMERVILLE
      ['Limited'].include?(student.limited_english_proficiency)
    elsif @district_key == NEW_BEDFORD
      ['Limited English' || 'Non-English'].include?(student.limited_english_proficiency)
    elsif @district_key == BEDFORD
      ['Limited English', 'Not Capable'].include?(student.limited_english_proficiency)
    else
      raise_not_handled!
    end
  end

  def current_quarter(date_time)
    raise_not_handled! unless @district_key == SOMERVILLE

    # See https://docs.google.com/document/d/1HCWMlbzw1KzniitW24aeo_IgjzNDSR-U9Rx_md1Qto8/edit
    year = SchoolYear.to_school_year(date_time)
    return 'SUMMER' if date_time < DateTime.new(year, 8, 29)
    return 'Q1' if date_time < DateTime.new(year, 11, 5)
    return 'Q2' if date_time < DateTime.new(year + 1, 1, 23)
    return 'Q3' if date_time < DateTime.new(year + 1, 4, 3)
    return 'Q4' if date_time < DateTime.new(year + 1, 6, 12)
    'SUMMER'
  end

  # When importing data from Google Forms, educator emails may not be the same
  # as the in the district SIS or LDAP system (eg, a name change happens in one system
  # but not the other).  This allow mapping one way from Google email > Educator#email
  def google_email_address_mapping
    JSON.parse(ENV.fetch('GOOGLE_EMAIL_ADDRESS_MAPPING_JSON', '{}'))
  end

  # For Bedford, we should fix this upstream with them
  def map_free_reduced_lunch_value_as_workaround(free_reduced_lunch_value)
    if @district_key == BEDFORD && free_reduced_lunch_value == 'Not Eligibile'
      'Not Eligible'
    else
      free_reduced_lunch_value
    end
  end

  private
  def yaml
    config_map = {
      SOMERVILLE => 'config/district_somerville.yml',
      NEW_BEDFORD => 'config/district_new_bedford.yml',
      BEDFORD => 'config/district_bedford.yml'
    }
    config_file_path = config_map[@district_key] || raise_not_handled!
    @yaml ||= YAML.load(File.open(config_file_path))
  end

  def raise_not_handled!
    raise Exceptions::DistrictKeyNotHandledError
  end
end
