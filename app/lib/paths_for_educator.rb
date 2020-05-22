# Determine paths for educators, based on what they have authorization to access.
class PathsForEducator
  def initialize(educator)
    @educator = educator
  end

  # Links shown on the navbar, different depending on role
  def navbar_links
    links = {}

    if PerDistrict.new.enabled_class_lists? && PerDistrict.new.show_link_for_class_lists? && ClassListQueries.new(@educator).is_relevant_for_educator?
      links[:classlists] = '/classlists'
    end

    if PerDistrict.new.enabled_high_school_levels? && @educator.labels.include?('should_show_levels_shs_link')
      links[:levels_shs] = '/levels/shs'
    end

    if PerDistrict.new.enabled_counselor_meetings? && @educator.labels.include?('enable_counselor_meetings_page')
      links[:counselor_meetings] = '/counselors/meetings'
    end

    if @educator.districtwide_access?
      links[:district] = '/district'
    end

    if @educator.school.present? && (@educator.schoolwide_access? || @educator.has_access_to_grade_levels?) && !@educator.districtwide_access?
      links[:school] = url_helpers.school_path(@educator.school)
    end

    if @educator.school.present? && @educator.schoolwide_access? && !@educator.districtwide_access?
      links[:absences] = url_helpers.absences_school_path(@educator.school)
      links[:tardies] = url_helpers.tardies_school_path(@educator.school)
      links[:discipline] = url_helpers.discipline_school_path(@educator.school)
    end

    if include_sections_link?(@educator)
      links[:section] = url_helpers.educators_my_sections_path
    end

    if @educator.homeroom.present? && !@educator.homeroom.school.is_high_school? && @educator.homeroom.students.active.size > 0
      links[:homeroom] = url_helpers.homeroom_path(@educator.homeroom.id) # explicitly use id, not slug.  see Homeroom.rb for more
    end

    links
  end

  private
  def include_sections_link?(educator)
    return false unless PerDistrict.new.allow_sections_link?(educator)
    assigned_sections = Authorizer.new(educator).authorized { educator.sections }
    assigned_sections.size > 0
  end

  def url_helpers
    Rails.application.routes.url_helpers
  end
end
