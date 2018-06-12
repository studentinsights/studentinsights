# Server code that's different per-district.  Centralize here
# whereever possible rather than leaking out to different places in
# the codebase.
#
# If this gets too big we can refactor :)
class PerDistrict
  NEW_BEDFORD = 'new_bedford'
  SOMERVILLE = 'somerville'
  DEMO = 'demo'

  VALID_DISTRICT_KEYS = [
    NEW_BEDFORD,
    SOMERVILLE,
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

  def enabled_class_lists?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_CLASS_LISTS')
    else
      false
    end
  end

  def include_incident_cards?
    EnvironmentVariable.is_true('FEED_INCLUDE_INCIDENT_CARDS') || false
  end

  # The schools shown on the admin page are in different orders,
  # with pilot schools in New Bedford shown first.
  def ordered_schools_for_admin_page
    if @district_key == NEW_BEDFORD
      School.where(local_id: ['115', '123']) # parker and pulaski, the first pilot schools
    else
      School.all
    end
  end

  # In the import process, we typically only get usernames
  # as the `login_name`, but we want our user account system
  # and our communication with district authentication systems
  # to always be in terms of full email addresses with domain
  # names.
  def from_import_login_name_to_email(login_name)
    if @district_key == SOMERVILLE
      login_name + '@k12.somerville.ma.us'
    elsif @district_key == NEW_BEDFORD
      login_name + '@newbedfordschools.org'
    elsif @district_key == DEMO
      raise "PerDistrict#from_import_login_name_to_email not supported for district_key: {DEMO}"
    else
      raise_not_handled!
    end
  end

  def import_detailed_attendance_fields?
    return true if @district_key == SOMERVILLE

    return false if  @district_key == NEW_BEDFORD

    raise 'import_detailed_attendance_fields? not supported for DEMO' if @district_key == DEMO

    raise_not_handled!
  end

  # If this is enabled, student-level authorization is determined by a different rule set
  # than normal, based on a mapping of the `counselor` field on the student and a specific
  # `Educator`.  It may be individually feature switched as well.
  def enable_counselor_based_authorization?
    if @district_key == SOMERVILLE || @district_key == DEMO
      EnvironmentVariable.is_true('ENABLE_COUNSELOR_BASED_AUTHORIZATION')
    else
      false
    end
  end

  # For transition meetings at the end of the school year, this allows 9th grade
  # housemasters access to students in eighth grade.
  def housemasters_authorized_for_grade_eight?
    if @district_key == SOMERVILLE || @district_key == DEMO
      ENV['HOUSEMASTERS_AUTHORIZED_FOR_GRADE_8']
    else
      false
    end
  end

  private
  def raise_not_handled!
    raise Exceptions::DistrictKeyNotHandledError
  end
end
