class McasImporter
  include X2Importer

  def export_file_name
    'assessment_export.txt'
  end

  def import_row(row)
    if row[:assessment_test] == 'MCAS'
      student = Student.where(state_id: row[:state_id]).first_or_create!
      mcas_result = McasResult.where(
        student_id: student.id,
        date_taken: row[:assessment_date],
      ).first_or_create!
      case row[:assessment_subject]
      when "Math"
        result = {
          math_scaled: row[:assessment_scale_score],
          math_performance: row[:assessment_perf_level]
        }
      when "ELA"
        result = {
          ela_scaled: row[:assessment_scale_score],
          ela_performance: row[:assessment_perf_level]
        }
      end
      mcas_result.update_attributes(result)
    end
  end
end
