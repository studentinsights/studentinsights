class StudentRowsQuery < Struct.new :homeroom

  def to_rows

    timestamp = Time.now.to_i

    sql = \
        "DROP TABLE IF EXISTS temporary_students_#{timestamp};

        CREATE TABLE temporary_students_#{timestamp} AS (
          SELECT
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
          WHERE homeroom_id = '#{homeroom.id}'
        );

        DROP TABLE IF EXISTS temporary_student_assessments_#{timestamp} CASCADE;

        CREATE TABLE temporary_student_assessments_#{timestamp} AS (
          SELECT DISTINCT ON
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
          WHERE homeroom_id = '#{homeroom.id}'
          AND assessments.family
            IN ('MCAS', 'STAR', 'ACCESS', 'DIBELS')
          ORDER BY
            students.id,
            assessments.family,
            assessments.subject,
            student_assessments.date_taken DESC NULLS LAST
      );

      DROP TABLE IF EXISTS temporary_student_rows_#{timestamp} CASCADE;

      CREATE TABLE temporary_student_rows_#{timestamp} AS (
        SELECT
          temporary_students_#{timestamp}.student_id AS id,
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
          explanation,
          family,
          subject,
          scale_score,
          growth_percentile,
          percentile_rank,
          instructional_reading_level,
          performance_level,
          date_taken
        FROM temporary_students_#{timestamp}
        LEFT JOIN temporary_student_assessments_#{timestamp}
          ON temporary_student_assessments_#{timestamp}.student_id = temporary_students_#{timestamp}.student_id
        ORDER BY
          level DESC NULLS LAST
      );

      SELECT * FROM temporary_student_rows_#{timestamp};"

    rows = []
    ActiveRecord::Base.connection.execute(sql).each do |row|
      rows << row
    end

    destroy_sql = \
      "DROP TABLE IF EXISTS temporary_students_#{timestamp};
       DROP TABLE IF EXISTS temporary_student_assessments_#{timestamp} CASCADE;
       DROP TABLE IF EXISTS temporary_student_rows_#{timestamp} CASCADE;"

    ActiveRecord::Base.connection.execute(destroy_sql)
    return rows
  end

end
