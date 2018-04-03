# Determine paths for educators, based on what they have authorization to access.
class PathsForEducator
  def initialize(educator)
    @educator = educator
  end

  # There are five types of entry experiences, depending on levels
  # of access.
  def homepage_type
    begin
      return :districtwide if @educator.districtwide_access?
      return :school if @educator.schoolwide_access? || @educator.has_access_to_grade_levels?
      return :section if @educator.school.is_high_school? && @educator.default_section
      return :homeroom if @educator.homeroom.present? && !@educator.homeroom.school.is_high_school? && @educator.default_homeroom
      return :nothing
    rescue Exceptions::NoAssignedHomeroom, Exceptions::NoAssignedSections => _
      :nothing
    end
  end

  # Return the homepage path, depending on the educator's role
  def homepage_path
    type = homepage_type
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

  # Links shown on the navbar, different depending on role
  def navbar_links
    links = Set.new
    links += [:district] if @educator.districtwide_access?
    links += [:school] if @educator.school.present? && (@educator.schoolwide_access? || @educator.has_access_to_grade_levels?) && !@educator.districtwide_access?
    links += [:sections] if @educator.school.present? && @educator.school.is_high_school? && @educator.sections.size > 0
    links += [:homeroom] if @educator.homeroom.present? && !@educator.homeroom.school.is_high_school?
    links
  end

  def url_helpers
    Rails.application.routes.url_helpers
  end
end
