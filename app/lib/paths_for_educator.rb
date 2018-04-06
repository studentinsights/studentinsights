# Determine paths for educators, based on what they have authorization to access.
class PathsForEducator
  def initialize(educator)
    @educator = educator
  end

  # Links shown on the navbar, different depending on role
  def navbar_links
    links = {}

    if @educator.districtwide_access?
      links[:district] = url_helpers.educators_districtwide_path
    end

    if @educator.school.present? && (@educator.schoolwide_access? || @educator.has_access_to_grade_levels?) && !@educator.districtwide_access?
      links[:school] = url_helpers.school_path(@educator.school)
    end

    if @educator.school.present? && @educator.schoolwide_access? && !@educator.districtwide_access?
      links[:absences] = url_helpers.school_administrator_dashboard_school_path(@educator.school) + '#/absences_dashboard'
      links[:tardies] = url_helpers.school_administrator_dashboard_school_path(@educator.school) + '#/tardies_dashboard'
    end

    if @educator.school.present? && @educator.school.is_high_school? && @educator.sections.size > 0
      links[:section] = url_helpers.section_path(@educator.default_section)
    end

    if @educator.homeroom.present? && !@educator.homeroom.school.is_high_school?
      links[:homeroom] = url_helpers.homeroom_path(@educator.default_homeroom)
    end

    links
  end

  private
  def url_helpers
    Rails.application.routes.url_helpers
  end
end
