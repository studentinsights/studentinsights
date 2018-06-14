class ConfigController < ApplicationController
  before_action :ensure_authorized!

  def counselor_name_mappings_json
    counselor_name_mappings_json = CounselorNameMapping.all.as_json
    counselor_name_fields = Student.active.map(&:counselor).uniq
    render json: {
      counselor_name_mappings: counselor_name_mappings_json,
      counselor_name_fields: counselor_name_fields
    }
  end

  def authorization_overview
    @all_educators = Educator.all

    @districtwide_educators = []
    @can_set_educators = []
    @admin_educators = []
    @restricted_notes_educators = []

    @all_educators.each do |educator|
      @districtwide_educators << educator if educator.districtwide_access
      @can_set_educators << educator if educator.can_set_districtwide_access
      @admin_educators << educator if educator.admin
      @restricted_notes_educators << educator if educator.can_view_restricted_notes
    end
    render layout: false
  end

  private
  def ensure_authorized!
    raise Exceptions::EducatorNotAuthorized unless current_educator.can_set_districtwide_access
  end
end
