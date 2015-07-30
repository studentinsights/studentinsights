class StarMathImporter
  include Importer

  def export_file_name
    'SM.csv'
  end

  def assessment_family
    AssessmentFamily.where(name: "STAR").first_or_create!
  end

  def assessment_subject
    AssessmentSubject.where(name: "Math").first_or_create!
  end

  def import_row(row)
    date_taken = Date.strptime(row[:date_taken].split(' ')[0], "%m/%d/%Y")
    student = Student.where(local_id: row[:local_id]).first_or_create!

    star_assessment = Assessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment_family_id: assessment_family.id,
      assessment_subject: assessment_subject.id
    }).first_or_create!

    star_assessment.update_attributes({percentile_rank: row[:percentile_rank]})
  end
end
