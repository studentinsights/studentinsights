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

  def valid_plan_504_values
    if @district_key == SOMERVILLE || @district_key == DEMO
      ["504", "Not 504", "NotIn504"]
    elsif @district_key == NEW_BEDFORD
      ["", "Active", "Exited", "NotIn504"]
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

  # The schools shown on the admin page are in different orders,
  # with pilot schools in New Bedford shown first.
  def ordered_schools_for_admin_page
    if @district_key == NEW_BEDFORD
      School.where(local_id: [
        # Pilot schools
        '115',  # Parker
        '123',  # Pulaski

        # New 2018-19 school year schools
        '040',  # Congdon
        '050',  # DeValles
        '405',  # Keith Middle
        '415',  # Roosevelt Middle
        '410',  # Normandin Middle
        '063',  # Gomes
        '045',  # Carney
        '078',  # Hayden McFadden

        # Next wave of 2018-19 schools
        '010',  # Ashley
        '015',  # Brooks
        '020',  # Campbell
        '105',  # Pacheco
      ])
    else
      School.all
    end
  end

  def high_school_enabled?
    @district_key == SOMERVILLE
  end

  def enabled_high_school_tiering?
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

  def import_detailed_attendance_fields?
    return true if @district_key == SOMERVILLE

    return false if @district_key == NEW_BEDFORD

    raise 'import_detailed_attendance_fields? not supported for DEMO' if @district_key == DEMO

    raise_not_handled!  # Importing attendance not handled yet for BEDFORD
  end

  def import_student_house?
    @district_key == SOMERVILLE || @district_key == DEMO
  end

  def import_student_counselor?
    @district_key == SOMERVILLE || @district_key == DEMO
  end

  def import_student_sped_liaison?
    @district_key == SOMERVILLE || @district_key == DEMO
  end

  def import_student_photos?
    @district_key == SOMERVILLE
  end

  def import_dibels?
    @district_key == SOMERVILLE
  end

  def filenames_for_iep_pdf_zips
    if @district_key == SOMERVILLE
      LoadDistrictConfig.new.remote_filenames.fetch('FILENAMES_FOR_IEP_PDF_ZIPS', [])
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

  private
  def raise_not_handled!
    raise Exceptions::DistrictKeyNotHandledError
  end
end
