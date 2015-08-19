class HomeroomsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    student_attributes_sql = \
            "SELECT
              students.id as student_id,
              race,
              first_name,
              last_name,
              grade,
              program_assigned,
              home_language,
              free_reduced_lunch,
              sped_placement,
              disability,
              sped_level_of_need,
              plan_504,
              limited_english_proficiency,
              level,
              explanation
            FROM students
            LEFT JOIN student_risk_levels
              ON student_risk_levels.student_id = students.id
            WHERE homeroom_id = #{@homeroom.id};"

    student_assessments_sql = \
            " SELECT DISTINCT ON
              (students.id, assessments.family, assessments.subject)
              students.id as student_id,
              family,
              subject,
              scale_score,
              growth_percentile,
              percentile_rank,
              instructional_reading_level,
              performance_level,
              date_taken
            FROM students
            LEFT JOIN student_assessments
              ON student_assessments.student_id = students.id
            LEFT JOIN assessments
              ON student_assessments.assessment_id = assessments.id
            WHERE homeroom_id = #{@homeroom.id}
            AND assessments.family
              IN ('MCAS', 'STAR', 'ACCESS', 'DIBELS')
            ORDER BY
              students.id,
              assessments.family,
              assessments.subject,
              student_assessments.date_taken DESC NULLS LAST;"

    student_assessment_results = []
    students = []

    ActiveRecord::Base.transaction do
      ActiveRecord::Base.connection.execute(student_assessments_sql).each do |row|
        student_assessment_results << row
      end
      ActiveRecord::Base.connection.execute(student_attributes_sql).each do |row|
        students << row
      end
    end

    student_assessments_by_student_id = student_assessment_results.group_by { |row| row['student_id'] }
    attributes_by_student_id = students.group_by { |row| row['student_id'] }

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
