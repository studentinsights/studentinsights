class HomeroomsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    cookies[:columns_selected] ||= ['name', 'risk', 'sped', 'mcas'].to_json
    @query = StudentRowsQuery.new(@homeroom)
    @student_attribute_rows = @query.student_attribute_rows
    @student_assessment_rows = @query.student_assessment_rows

    student_assessments_by_student_id = @student_assessment_rows.group_by { |row| row['student_id'] }
    attributes_by_student_id = @student_attribute_rows.group_by { |row| row['student_id'] }

    @rows = []

    attributes_by_student_id.each do |result|
      this_student_id = result[0]
      student_attributes = result[1][0]
      student_assessment_results = student_assessments_by_student_id[this_student_id]

      star_math_row_data = student_assessment_results.select do |h|
        h['family'] == 'STAR' &&  h['subject'] == 'Math'
      end[0] if student_assessment_results.present?
      star_reading_row_data = student_assessment_results.select do |h|
        h['family'] == 'STAR' &&  h['subject'] == 'Reading'
      end[0] if student_assessment_results.present?
      mcas_math_row_data = student_assessment_results.select do |h|
        h['family'] == 'MCAS' &&  h['subject'] == 'Math'
      end[0] if student_assessment_results.present?
      mcas_ela_row_data = student_assessment_results.select do |h|
        h['family'] == 'MCAS' &&  h['subject'] == 'ELA'
      end[0] if student_assessment_results.present?
      access_row_data = student_assessment_results.select do |h|
        h['family'] == 'ACCESS'
      end[0] if student_assessment_results.present?
      dibels_row_data = student_assessment_results.select do |h|
        h['family'] == 'DIBELS'
      end[0] if student_assessment_results.present?

      @rows << {
        student: Student.find(this_student_id),
        student_presenter: StudentRowPresenter.new(student_attributes),
        assessment_data: {
          star_math_row_data: star_math_row_data,
          star_reading_row_data: star_reading_row_data,
          mcas_math_row_data: mcas_math_row_data,
          mcas_ela_row_data: mcas_ela_row_data,
          access_row_data: access_row_data,
          dibels_row_data: dibels_row_data
        }
      }
    end

    @student_risk_levels = []

    attributes_by_student_id.each do |result|
      @student_risk_levels << {
        student_id: result[0],
        level: result[1][0]['level'],
        explanation: result[1][0]['explanation']
      }
    end

    @homerooms_by_name = Homeroom.where.not(name: "Demo").order(:name)
    @current_school_year = SchoolYear.date_to_school_year(Time.new)
  end

  private

  def assign_homeroom
    @homeroom = Homeroom.friendly.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    if current_educator.homeroom.present?
      @homeroom = current_educator.homeroom
    else
      @homeroom = Homeroom.first
    end
  end

end
