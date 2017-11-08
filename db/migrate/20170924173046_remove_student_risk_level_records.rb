class RemoveStudentRiskLevelRecords < ActiveRecord::Migration[5.1]
  # See https://github.com/studentinsights/studentinsights/issues/1071
  def change
    students = Student.all
    good_student_risk_level_ids = student_risk_level_ids_for(students)
    bad_student_risk_level_ids = StudentRiskLevel.all.where.not(id: good_student_risk_level_ids)
    puts "Found: #{students.size} students"
    puts "Found: #{good_student_risk_level_ids.size} StudentRiskLevel records through Student associations"
    puts "Found: #{bad_student_risk_level_ids.size} other StudentRiskLevel records"

    puts "Checking some conditions..."
    if ENV['SHOULD_REPORT_ERRORS'] && good_student_risk_level_ids.size <= 0
      raise "no good records"
    elsif ENV['SHOULD_REPORT_ERRORS'] && StudentRiskLevel.all.size != 0 && bad_student_risk_level_ids.size >= StudentRiskLevel.all.size
      raise "more bad records than expected"
    elsif ENV['SHOULD_REPORT_ERRORS'] && (bad_student_risk_level_ids.size + good_student_risk_level_ids.size != StudentRiskLevel.all.size)
      raise "bad and good records don't equal total"
    end

    puts "Deleting records..."
    deleted_record_count = StudentRiskLevel.where(id: bad_student_risk_level_ids).delete_all
    puts "Deleted #{deleted_record_count} StudentRiskLevel records."
    puts "Done."

    puts "Confirming..."
    remaining_good_count = student_risk_level_ids_for(students).size
    puts "Found #{remaining_good_count} StudentRiskLevel records through Student associations"
    all_count = StudentRiskLevel.all.size
    puts "Found #{all_count} StudentRiskLevel records total"
  end

  def student_risk_level_ids_for(students)
    students.map {|student| student.try(:student_risk_level).try(:id) }.compact
  end
end
