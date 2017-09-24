class RemoveStudentRiskLevelRecords < ActiveRecord::Migration[5.1]
  # See https://github.com/studentinsights/studentinsights/issues/1071
  def change
    students = Student.all
    good_student_risk_level_ids = students.map(&:student_risk_level).map(&:id)
    bad_student_risk_level_ids = StudentRiskLevel.all.where.not(id: good_student_risk_level_ids)
    puts "Found: #{students.size} students"
    puts "Found: #{good_student_risk_level_ids.size} StudentRiskLevel records through Student associations"
    puts "Found: #{bad_student_risk_level_ids.size} other StudentRiskLevel records"

    puts "Checking some conditions..."
    if good_student_risk_level_ids.size <= 0
      raise "no good records"
    elsif bad_student_risk_level_ids.size >= StudentRiskLevel.all.size
      raise "more bad records than expected"
    elsif bad_student_risk_level_ids.size + good_student_risk_level_ids.size != StudentRiskLevel.all.size
      raise "bad and good records don't equal total"
    end

    puts "Destroying..."
    StudentRiskLevel.where(id: bad_student_risk_level_ids).destroy!
    puts "Done."

    puts "Confirming..."
    remaining_good_count = Student.all.map(&:student_risk_level).map(&:id).size
    puts "Found #{remaining_good_count} StudentRiskLevel records through Student associations"
    all_count = StudentRiskLevel.all.size
    puts "Found #{all_count} StudentRiskLevel records total"
  end

end
