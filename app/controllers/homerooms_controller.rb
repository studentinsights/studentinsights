class HomeroomsController < ApplicationController
  include StudentsQueryHelper

  # Authentication by default inherited from ApplicationController.

  before_action :authorize_and_assign_homeroom

  def show
    cookies[:columns_selected] ||= initial_columns.to_json

    @rows = eager_students().map {|student| fat_student_hash(student) }

    # Dropdown for homeroom navigation
    @homerooms_by_name = current_educator.allowed_homerooms.order(:name)

    # For JSX Table:
    @serialized_data = {
      school: @homeroom.school,
      show_star: @homeroom.show_star?,
      show_mcas: @homeroom.show_mcas?,
      rows: @rows
    }
  end

  private

  def initial_columns
    return ['name', 'risk', 'sped', 'mcas_math', 'mcas_ela', 'interventions'] if @homeroom.show_mcas?
    return ['name', 'risk', 'sped', 'interventions']
  end

  def eager_students(*additional_includes)
    @homeroom.students.active.includes([
      :event_notes,
      :interventions,
      :student_risk_level,
      :homeroom,
    ] + additional_includes)
  end

  # Serializes a Student into a hash with other fields joined in (that are used to perform
  # filtering and slicing in the UI).
  # This may be slow if you're doing it for many students without eager includes.
  def fat_student_hash(student)
    HashWithIndifferentAccess.new(student_hash_for_slicing(student).merge({
      event_notes: student.event_notes,
      interventions: student.interventions,
      sped_data: student.sped_data,
      student_risk_level: student.student_risk_level.as_json_with_explanation
    }))
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
