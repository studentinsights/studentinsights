class SchoolsController < ApplicationController

  before_action :authenticate_admin!

  def show
    @school = School.friendly.find(params[:id])
    attendance_queries = AttendanceQueries.new(@school)
    mcas_queries = McasQueries.new(@school)

    @top_absences = attendance_queries.top_5_absence_concerns_serialized
    @top_tardies = attendance_queries.top_5_tardy_concerns_serialized
    @top_mcas_math_concerns = mcas_queries.top_5_math_concerns_serialized
    @top_mcas_ela_concerns = mcas_queries.top_5_ela_concerns_serialized
  end

  def homerooms
    @school = School.friendly.find(params[:id])
    homerooms = @school.students.map(&:homeroom).compact.uniq
    homeroom_queries = HomeroomQueries.new(homerooms)

    limit = 5
    @top_absences = homeroom_queries.top_absences.first(limit)
    @top_tardies = homeroom_queries.top_tardies.first(limit)
    @top_mcas_math_concerns = homeroom_queries.top_mcas_math_concerns.first(limit)
    @top_mcas_ela_concerns = homeroom_queries.top_mcas_ela_concerns.first(limit)
  end
end
