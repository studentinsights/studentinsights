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

  def cookie_key
    "_student_insights_session_for_#{district_key}"
  end

  def warning_banner_message
    return ENV['WARNING_BANNER_MESSAGE'] if ENV['WARNING_BANNER_MESSAGE'].present?
    return "This is a demo site!  It's filled with fake data." if @district_key == DEMO
    nil
  end

  def school_definitions_for_import
    yaml.fetch('school_definitions_for_import')
  end

  def try_star_filename(key, fallback = nil)
    yaml.fetch('star_filenames', {}).fetch(key, fallback)
  end

  # What filenames are district IT staff using when exporting specific
  # files to SFTP servers?
  def try_sftp_filename(key, fallback = nil)
    json = DistrictConfigLog.latest_json(DistrictConfigLog::SFTP_FILENAMES, {})
    json.fetch(key, fallback)
  end

  # This migrates up older formats still in use in New Bedfor
  # into the v2 format that was new in Somerville for the 2019
  # year.  The importer is minimal to keep the maintenance cost
  # low here.
  #
  #  v1                   v2
  # ----------------------------------------
  #  StudentLocalID    => StudentIdentifier
  #  AssessmentDate    => CompletedDate (parsed into Ruby Time)
  #  PercentileRank    => PercentileRank
  #  GradeEquivalent   => GradeEquivalent
  #  TotalTime         => TotalTimeInSeconds
  #
  # If these differences become more substantive, we can break this
  # apart into two separate importers, but since these are just name
  # changes this is okay for now.
  def parsed_normalized_star_row(row)
    if @district_key == NEW_BEDFORD # translated safelist
      {
        'SchoolIdentifier' => row['SchoolLocalID'],
        'StudentIdentifier' => row['StudentLocalID'],
        'CompletedDate' => parse_star_date_taken_with_v1_format(row['AssessmentDate']),
        'PercentileRank' => row['PercentileRank'],
        'GradeEquivalent' => row['GradeEquivalent'],
        'TotalTimeInSeconds' => row['TotalTime']
      }
    elsif @district_key == SOMERVILLE # passthrough safelist
      {
        'SchoolIdentifier' => row['SchoolIdentifier'],
        'StudentIdentifier' => row['StudentIdentifier'],
        'CompletedDate' => parse_star_date_taken_with_v2_format(row['CompletedDate']), # alt, LaunchDate, CompletedDateLocal
        'PercentileRank' => row['PercentileRank'],
        'GradeEquivalent' => row['GradeEquivalent'],
        'TotalTimeInSeconds' => row['TotalTimeInSeconds']
      }
    else
      raise_not_handled!
    end
  end

  # Parse in EDT/EST, depending on parse date (probably should be depending on
  # the date itself.  In earlier iterations this parsing was fixed to CDT.
  def parse_star_date_taken_with_v1_format(datetime_string)
    eastern_offset = Time.now.in_time_zone('Eastern Time (US & Canada)').formatted_offset
    DateTime.strptime("#{datetime_string} #{eastern_offset}", '%m/%d/%Y %H:%M:%S %Z')
  end

  # Remove microseconds manually, since I can't figure out how to get Ruby
  # to parse it properly, and always interpret as being in eastern time.
  def parse_star_date_taken_with_v2_format(text)
    text_without_microseconds = text.first(-4)
    eastern_offset = Time.now.in_time_zone('Eastern Time (US & Canada)').formatted_offset
    DateTime.strptime("#{text_without_microseconds} #{eastern_offset}", '%Y-%m-%d %H:%M:%S %Z')
  end

  # Support patching this for Somerville, so that it is derived
  # from the actual 504 plan document, since the SIS field from
  # the student export is inaccurate (eg, not considering if status of
  # the ed plan).
  def patched_plan_504(student)
    if @district_key == SOMERVILLE
      # When run across a `Student` collection, this approach trigers n+1 queries
      # even if `ed_plans` was eagerly loaded and there are no records.
      #
      # To avoid this, we could filter in memory, but that would trigger n+1 when
      # not eagerly loaded.
      #
      #  eg: student.ed_plans.select(&:active?).size > 0 ? '504' : nil
      #
      # Because this method is called from a validation, it's hard for callers
      # to control this, and changing may require a new PerfTest.
      student.ed_plans.active.size > 0 ? '504' : nil
    else
      student.plan_504(force: true)
    end
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

  def enabled_counselor_meetings?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_COUNSELOR_MEETINGS')
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

  def include_student_voice_cards?
    EnvironmentVariable.is_true('FEED_INCLUDE_STUDENT_VOICE_CARDS') || false
  end

  def include_q2_self_reflection_insights?
    EnvironmentVariable.is_true('PROFILE_INCLUDE_Q2_SELF_REFLECTION_INSIGHTS') || false
  end

  # Allow env to override
  # This is a global kill-switch for the server, as other callers check it (eg, when
  # using sections for authorization, for showing navbar links, for allowing controller
  # endpoints).
  def enabled_sections?
    return EnvironmentVariable.is_true('ENABLED_SECTIONS') if ENV.has_key?('ENABLED_SECTIONS')
    return true if [SOMERVILLE, DEMO].include?(@district_key)
    false
  end

  # Note that this may be called in performance-sensitive loops.
  def should_consider_sections_for_student_level_authorization?
    return false unless self.enabled_sections? # respect global switch

    return EnvironmentVariable.is_true('SHOULD_CONSIDER_SECTIONS_FOR_STUDENT_LEVEL_AUTHORIZATION') if ENV.has_key?('SHOULD_CONSIDER_SECTIONS_FOR_STUDENT_LEVEL_AUTHORIZATION')
    if [SOMERVILLE, NEW_BEDFORD, DEMO].include?(@district_key)
      true
    elsif @district_key == BEDFORD
      false
    else
      false
    end
  end

  # Note that this may be called in performance-sensitive loops.
  def allow_sections_link?(educator)
    return false unless self.enabled_sections? # respect global switch

    # sections aren't used for rostering in MSin Somerville, but data is imported and they could be
    return EnvironmentVariable.is_true('ALLOW_SECTIONS_LINK') if ENV.has_key?('ALLOW_SECTIONS_LINK')
    if @district_key == SOMERVILLE || @district_key == DEMO
      educator.school.try(:is_high_school?) || false
    elsif @district_key == NEW_BEDFORD
      false
    else
      false
    end
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

  # For Somerville after school programs
  def enable_community_school_based_feed?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_COMMUNITY_SCHOOL_BASED_FEED')
    else
      false
    end
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

  # Allow specific educator records to always be considered
  # 'active' regardless of whether they were in the latest SIS
  # export.  This should only apply to developer accounts, which
  # districts sometimes handle differently.
  def educator_login_names_whitelisted_as_active
    ENV.fetch('EDUCATOR_LOGIN_NAMES_WHITELISTED_AS_ACTIVE', '').split(',')
  end

  # Allows username or full email address, depending on district.
  # Transitioning to username only.
  def find_educator_by_login_text(login_text)
    cleaned_login_text = login_text.downcase.strip
    if @district_key == BEDFORD
      Educator.find_by_login_name(cleaned_login_text)
    elsif @district_key == SOMERVILLE || @district_key == NEW_BEDFORD || @district_key == DEMO
      Educator.find_by_login_name(cleaned_login_text) || Educator.find_by_email(cleaned_login_text)
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
    return true if @district_key == BEDFORD  # this data is in export, but not meaningful for K8
    return true if @district_key == DEMO
    false
  end

  # This always gets just the last name (there's no reason for this, it's just
  # historical for what this did in Somerville and could be changed to import
  # the full name).
  def parse_counselor_during_import(value)
    if @district_key == SOMERVILLE # eg, Robinson, Kevin
      if value then value.split(',').first else nil end
    elsif @district_key == BEDFORD # eg, Kevin Robinson
      if value then value.split(' ').last else nil end
    else
      raise_not_handled!
    end
  end

  def import_student_sped_liaison?
    return true if @district_key == SOMERVILLE
    return true if @district_key == DEMO
    false
  end

  # Bedford exports "N/A" for all students
  def parse_sped_liaison_during_import(value)
    if @district_key == BEDFORD
      if value.try(:upcase) == "N/A" then nil else value end
    else
      value
    end
  end

  def import_student_ell_dates?
    return true if @district_key == SOMERVILLE
    return true if @district_key == DEMO
    false
  end

  def import_student_photos?
    return true if @district_key == SOMERVILLE
    return true if @district_key == BEDFORD
    return true if @district_key == NEW_BEDFORD
    false
  end

  def import_dibels?
    @district_key == SOMERVILLE
  end

  def team_membership_importer_enabled?
    @district_key == SOMERVILLE
  end

  # Specifically whether this importer class runs as part of import jobs
  def student_voice_survey_importer_enabled?
    @district_key == SOMERVILLE
  end

  # Should we run this import job about student meetings.
  def student_meeting_importer_enabled?
    @district_key == SOMERVILLE
  end

  # Should this run as part of import jobs?
  def reading_benchmark_sheets_importer_enabled?
    @district_key == SOMERVILLE
  end

  def filenames_for_iep_pdf_zips_ordered_oldest_to_newest
    if @district_key == SOMERVILLE
      try_sftp_filename('FILENAMES_FOR_IEP_PDF_ZIPS_ORDERED_OLDEST_TO_NEWEST', [])
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

  # See also language.js
  def is_student_english_learner_now?(student)
    if @district_key == SOMERVILLE
      ['Limited'].include?(student.limited_english_proficiency)
    elsif @district_key == NEW_BEDFORD
      ['Limited English', 'Non-English'].include?(student.limited_english_proficiency)
    elsif @district_key == BEDFORD
      ['Limited English', 'Not Capable'].include?(student.limited_english_proficiency)
    else
      raise_not_handled!
    end
  end

  def current_quarter(date_time)
    if @district_key == SOMERVILLE || @district_key == DEMO
      # See https://docs.google.com/document/d/1HCWMlbzw1KzniitW24aeo_IgjzNDSR-U9Rx_md1Qto8/edit
      year = SchoolYear.to_school_year(date_time)
      return 'SUMMER' if date_time < DateTime.new(year, 8, 29)
      return 'Q1' if date_time < DateTime.new(year, 11, 5)
      return 'Q2' if date_time < DateTime.new(year + 1, 1, 23)
      return 'Q3' if date_time < DateTime.new(year + 1, 4, 3)
      return 'Q4' if date_time < DateTime.new(year + 1, 6, 12)
      'SUMMER'
    else
      raise_not_handled!
    end
  end

  # When importing data from Google Forms, educator emails may not be the same
  # as the in the district SIS or LDAP system (eg, a name change happens in one system
  # but not the other).  This allow mapping one way from Google email > Educator#email
  def google_email_address_mapping
    JSON.parse(ENV.fetch('GOOGLE_EMAIL_ADDRESS_MAPPING_JSON', '{}'))
  end

  # While SIS files are in yaml files, keep Google drive folder_ids out
  # of source and avoid logging them.  This is to guard in case
  # educators mistakenly set any folders or documents to have
  # public permissions.
  def imported_google_folder_ids(key)
    if @district_key == BEDFORD || @district_key == SOMERVILLE
      json = JSON.parse(ENV.fetch('IMPORTED_GOOGLE_FOLDER_IDS_JSON', '{}'))
      json.fetch(key, nil)
    else
      raise_not_handled!
    end
  end

  # For Bedford, we should fix this upstream with them
  def map_free_reduced_lunch_value_as_workaround(free_reduced_lunch_value)
    if @district_key == BEDFORD && free_reduced_lunch_value == 'Not Eligibile'
      'Not Eligible'
    else
      free_reduced_lunch_value
    end
  end

  # Different districts export assessment data in different ways, and
  # import different specific assessments or use different code to process
  # it.
  def choose_assessment_importer_row_class(row)
    if @district_key == SOMERVILLE
      case row[:assessment_test]
        when 'MCAS' then McasRow
        when 'ACCESS', 'WIDA', 'WIDA-ACCESS' then AccessRow
        when 'DIBELS' then DibelsRow
        else nil
      end
    elsif @district_key == BEDFORD
      if /MCAS Gr (\d+) (Math|ELA)/.match(row[:assessment_test]).present?
        McasRow
      else
        nil
      end
    elsif @district_key == NEW_BEDFORD
      case row[:assessment_test]
        when 'MCAS' then McasRow
        when 'ACCESS' then AccessRow
        else nil
      end
    else
      raise_not_handled!
    end
  end

  # Map the row of an MCAS row to a normalized Insights Assessment subject field.
  def normalized_subject_from_mcas_export(row)
    if @district_key == SOMERVILLE
      if 'English Language Arts'.in?(row[:assessment_name])
        'ELA'
      else
        row[:assessment_subject]
      end
    elsif @district_key == BEDFORD
      if row[:assessment_subject] == 'Math'
        'Mathematics'
      else
        row[:assessment_subject]
      end
    elsif @district_key == NEW_BEDFORD
      row[:assessment_subject] # no changes
    else
      raise_not_handled!
    end
  end

  # This is just a heuristic for Somerville, see links like:
  # http://www.somerville.k12.ma.us/schools/somerville-high-school/departments-academics/athletics/spring-sports-registration
  def sports_season_key(date_time)
    return nil unless @district_key == SOMERVILLE

    school_year = SchoolYear.to_school_year(date_time)
    if date_time < DateTime.new(school_year, 11, 26)
      :fall
    elsif date_time < DateTime.new(school_year + 1, 3, 18)
      :winter
    elsif date_time <= SchoolYear.last_day_of_school_for_year(school_year)
      :spring
    else
      nil
    end
  end

  def sign_in_params
    if @district_key == SOMERVILLE
      {
        district_url: 'http://www.somerville.k12.ma.us/',
        district_logo_src: 'sign_in/somerville-logo.jpg',
        district_logo_alt: "#{district_name} logo",
        splash_image_src: 'sign_in/somerville-sign-in-1.jpg',
        splash_image_alt: 'Students playing music'
      }
    elsif @district_key == BEDFORD
      {
        district_url: 'https://www.bedfordps.org/',
        district_logo_src: 'sign_in/bedford-logo.png',
        district_logo_alt: "#{district_name} logo",
        splash_image_src: 'sign_in/bedford-sign-in-1.jpg',
        splash_image_alt: "Veteran's Day ceremony"
      }
    elsif @district_key == NEW_BEDFORD
      {
        district_url: 'http://www.newbedfordschools.org/',
        district_logo_src: 'sign_in/new-bedford-logo.jpg',
        district_logo_alt: "#{district_name} logo",
        splash_image_src: 'sign_in/new-bedford-sign-in-1.jpg',
        splash_image_alt: 'Collage of New Bedford students'
      }
    elsif @district_key == DEMO
      {
        district_url: 'https://www.studentinsights.org/',
        district_logo_src: 'sign_in/demo-logo.png',
        district_logo_alt: "#{district_name} logo",
        splash_image_src: 'sign_in/demo-sign-in-1.jpg',
        splash_image_alt: 'Student thinking'
      }
    else
      raise_not_handled!
    end
  end

  def include_bedford_end_of_year_transition?
    if @district_key == BEDFORD
      true
    elsif @district_key == DEMO
      true
    else
      false
    end
  end

  def services_info_doc_url
    ENV.fetch('SERVICES_INFO_DOC_URL', nil)
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
