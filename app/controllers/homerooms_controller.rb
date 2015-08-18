class HomeroomsController < ApplicationController

  before_action :authenticate_educator!
  before_action :assign_homeroom

  def show
    sql = " SELECT DISTINCT ON
              (students.id, assessments.family, assessments.subject)
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

    results = []

    ActiveRecord::Base.connection.execute(sql).each do |row|
      results << row
    end

    results_by_student_id = results.group_by { |row| row['student_id'] }
    results_by_student = Hash[results_by_student_id.map { |k, v| [Student.find_by_id(k), v] }]

    @rows = []

    results_by_student.each do |result|
      student = result[0]
      row_data = result[1]

      @rows << {
        student: student,
        row_presenter: StudentRowPresenter.new(row_data[0]),
        assessment_data: {
          star_math_row_data: row_data.select { |h| h['family'] == 'STAR' &&  h['subject'] == 'Math' }[0],
          star_reading_row_data: row_data.select { |h| h['family'] == 'STAR' &&  h['subject'] == 'Reading' }[0],
          mcas_math_row_data: row_data.select { |h| h['family'] == 'MCAS' &&  h['subject'] == 'Math' }[0],
          mcas_ela_row_data: row_data.select { |h| h['family'] == 'MCAS' &&  h['subject'] == 'ELA' }[0],
          access_row_data: row_data.select { |h| h['family'] == 'ACCESS' }[0],
          dibels_row_data: row_data.select { |h| h['family'] == 'DIBELS' }[0]
        }
      }
    end

    @homerooms_by_name = Homeroom.where.not(name: "Demo").order(:name)
    @current_school_year = SchoolYear.date_to_school_year(Time.new)
  end

  private

  def assign_homeroom
    @homeroom = Homeroom.friendly.find(params[:homeroom_id])
  rescue ActiveRecord::RecordNotFound
    if current_educator.homeroom.present?
      @homeroom = current_educator.homeroom
    else
      @homeroom = Homeroom.first
    end
  end

end
