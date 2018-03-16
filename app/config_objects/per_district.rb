# Server code that's different per-district.  Centralize here
# whereever possible rather than leaking out to different places in
# the codebase.
#
# If this gets too big we can refactor :)
class PerDistrict
  NEW_BEDFORD = 'new_bedford'
  SOMERVILLE = 'somerville'

  def initialize(options = {})
    @district_key = options[:district_key] || ENV['DISTRICT_KEY']
    raise "PerDistrict#initialize couldn't find a value for district_key" if @district_key.nil?
  end

  # User-facing text
  def district_name
    ENV['DISTRICT_NAME']
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
end
