# Determine paths for educators, based on what they have authorization to access.
class PathsForEducator
  def initialize(educator)
    @educator = educator
  end

  # Return the homepage path, depending on the educator's role
  def homepage_path
    type = Authorizer.new(@educator).homepage_type
    if type == :districtwide
      url_helpers.educators_districtwide_path
    elsif type == :school
      url_helpers.school_path(@educator.school)
    elsif type == :section
      url_helpers.section_path(@educator.default_section)
    elsif type == :homeroom
      url_helpers.homeroom_path(@educator.default_homeroom)
    elsif type == :nothing
      url_helpers.no_default_page_path
    else
      url_helpers.no_default_page_path
    end
  end

  private
  def url_helpers
    Rails.application.routes.url_helpers
  end
end
