class StarReadingImporter
  include StarImporter

  def export_file_name
    'SR.csv'
  end

  def header_dictionary
    {
      'StudentStateID' => :state_id,
      'StudentLocalID' => :local_id,
      'AssessmentDate' => :date_taken,
      'PercentileRank' => :percentile_rank,
      'SchoolLocalID' => :school_local_id,
      'IRL' => :instructional_reading_level
    }
  end

  def assessment_subject
    AssessmentSubject.where(name: "Reading").first_or_create!
  end

  def import_row(row)
    date_taken = Date.strptime(row[:date_taken].split(' ')[0], "%m/%d/%Y")
    student = Student.where(state_id: row[:state_id]).first_or_create!

    star_assessment = Assessment.where({
      student_id: student.id,
      date_taken: date_taken,
      assessment_family_id: assessment_family.id,
      assessment_subject: assessment_subject.id
    }).first_or_create!

    star_assessment.update_attributes({
      percentile_rank: row[:percentile_rank],
      instructional_reading_level: row[:instructional_reading_level]
    })
  end
end
