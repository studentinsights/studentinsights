namespace :data_migration do
  desc 'Migrating older F&P table to remove it'
  task migrate_f_and_p_to_reading_benchmark: :environment do
    source = 'SYNC: F&P (12/6/18) sheet, originally from UH, imported from https://docs.google.com/spreadsheets/d/1UzUQJIQ34059SdL4ZsZjjACoPjHov36v-URv3NzP2fQ'

    FAndPAssessment.all.includes(:student).each do |f_and_p|
      grade = f_and_p.student.grade
      if grade.nil?
        puts "no grade for f_and_p: #{f_and_p}"
        next
      end

      grade_then = GradeLevels.new.previous(grade)
      ReadingBenchmarkDataPoint.create!({
        student_id: f_and_p.student_id,
        educator_id: f_and_p.uploaded_by_educator_id,
        created_at: f_and_p.created_at,
        updated_at: f_and_p.updated_at,
        json: {
          instructional_level: f_and_p.instructional_level,
          f_and_p_code: f_and_p.f_and_p_code
        },
        benchmark_school_year: 2017,
        benchmark_period_key: :spring,
        benchmark_assessment_key: 'f_and_p_english',
        benchmark_assessment_grade_level: grade_then,
        source: source
      })
    end
  end
end
