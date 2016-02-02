class HomeroomsController < ApplicationController

  # Authentication by default inherited from ApplicationController.

  before_action :authorize_and_assign_homeroom

  def show
    cookies[:columns_selected] ||= ['name', 'risk', 'sped', 'mcas_math', 'mcas_ela', 'interventions'].to_json

    @rows = eager_students().map {|student| fat_student_hash(student) }

    # Risk level chart
    @risk_levels = @homeroom.student_risk_levels.group(:level).count
    @risk_levels['null'] = if @risk_levels.has_key? nil then @risk_levels[nil] else 0 end

    # Dropdown for homeroom navigation
    @homerooms_by_name = current_educator.allowed_homerooms_by_name

    # Bulk intervention assignment in far-right column
    @bulk_intervention_assignment = BulkInterventionAssignment.new
  end

  private

  def eager_students(*additional_includes)
    Student.all.includes([
      :interventions,
      :student_risk_level,
      :homeroom,
      :student_school_years
    ] + additional_includes)
  end

  # Serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def fat_student_hash(student)
    student.as_json.merge({
      interventions: student.interventions,
      student_risk_level: student.student_risk_level.as_json,
      discipline_incidents_count: student.most_recent_school_year.discipline_incidents.count,
      absences_count: student.most_recent_school_year.absences.count,
      tardies_count: student.most_recent_school_year.tardies.count,
      homeroom_name: student.try(:homeroom).try(:name)
    })
  end

  def authorize_and_assign_homeroom
    @requested_homeroom = Homeroom.friendly.find(params[:id])

    if current_educator.allowed_homerooms.include? @requested_homeroom
      @homeroom = @requested_homeroom
    else
      redirect_to homepage_path_for_role(current_educator)
    end
  rescue ActiveRecord::RecordNotFound     # Params don't match an actual homeroom
    redirect_to homepage_path_for_role(current_educator)
  end
end
