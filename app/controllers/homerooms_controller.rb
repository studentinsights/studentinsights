class HomeroomsController < ApplicationController

  before_action :authenticate_educator!, :authorize_and_assign_homeroom

  def show
    cookies[:columns_selected] ||= ['name', 'risk', 'sped', 'mcas_math', 'mcas_ela', 'interventions'].to_json
    query_results = StudentRowsQuery.new(@homeroom).to_rows

    rows_by_student_id = Hash[query_results.group_by { |h| h['id'] }]
    @rows = []

    rows_by_student_id.each do |student_id, rows_of_student_assessments|
      first_row = rows_of_student_assessments[0]
      row = {
        student_id: student_id,
        student_presenter: StudentRowPresenter.new(first_row),
        assessment_data: {},
        student_risk_level: {
          student_id: student_id,
          level: first_row['level'],
          explanation: first_row['explanation']
        }
      }
      rows_of_student_assessments.each do |r|
        assessment_symbol = detect_assessment(r)
        row[:assessment_data][assessment_symbol] = r
      end
      @rows << row
    end

    @risk_levels = @homeroom.student_risk_levels.group(:level).count
    @risk_levels['null'] = if @risk_levels.has_key? nil then @risk_levels[nil] else 0 end
    @homerooms_by_name = current_educator.allowed_homerooms_by_name
    @interventions = @homeroom.students.map { |s| s.interventions.build }
  end

  private

  def detect_assessment(row)
    case row['family']
    when 'DIBELS'
      :dibels_row_data
    when 'ACCESS'
      :access_row_data
    when 'MAP'
      :map_row_data
    when 'MCAS'
      case row['subject']
      when 'Math'
        :mcas_math_row_data
      when 'ELA'
        :mcas_ela_row_data
      end
    when 'STAR'
      case row['subject']
      when 'Math'
        :star_math_row_data
      when 'Reading'
        :star_reading_row_data
      end
    end
  end

  def authorize_and_assign_homeroom
    if current_educator.admin?
      assign_homeroom_for_admin
    else
      assign_homeroom_for_non_admin
    end
  end

  def assign_homeroom_for_admin
    @homeroom = Homeroom.friendly.find(params[:id])
  rescue ActiveRecord::RecordNotFound   # params don't match a homeroom
    redirect_to homeroom_path(Homeroom.first)
  end

  def assign_homeroom_for_non_admin
    @educator_homeroom = current_educator.homeroom || not_found
    @requested_homeroom = Homeroom.friendly.find(params[:id])

    if @educator_homeroom == @requested_homeroom ||
        @educator_homeroom.grade == @requested_homeroom.grade
      @homeroom = @requested_homeroom
    else
      redirect_to_homeroom(current_educator)
    end
  rescue ActiveRecord::RecordNotFound   # params don't match a homeroom
    redirect_to_homeroom(current_educator)
  end

  def redirect_to_homeroom(educator)
    redirect_to homeroom_path(educator.homeroom)
  end

end
