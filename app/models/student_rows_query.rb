class StudentRowsQuery < Struct.new :homeroom

  def student_attribute_rows
    sql = \
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
            WHERE homeroom_id = #{homeroom.id}
            ORDER BY
              level DESC NULLS LAST;"
    rows = []
    ActiveRecord::Base.connection.execute(sql).each do |row|
      rows << row
    end
    return rows
  end

  def student_assessment_rows
    sql = \
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
            WHERE homeroom_id = #{homeroom.id}
            AND assessments.family
              IN ('MCAS', 'STAR', 'ACCESS', 'DIBELS')
            ORDER BY
              students.id,
              assessments.family,
              assessments.subject,
              student_assessments.date_taken DESC NULLS LAST;"
    rows = []
    ActiveRecord::Base.connection.execute(sql).each do |row|
      rows << row
    end
    return rows
  end
end
