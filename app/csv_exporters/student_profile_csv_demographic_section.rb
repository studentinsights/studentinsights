class StudentProfileCsvDemographicSection < Struct.new :csv, :exporter
  delegate :student, to: :exporter

  def add
    csv << ['Demographics']
    csv << ['Program Assigned', student.program_assigned]
    csv << ['504 Plan', student.plan_504]
    csv << ['Placement', student.sped_placement]
    csv << ['Disability', student.disability]
    csv << ['Level of Need', student.sped_level_of_need]
    csv << ['Language Fluency', student.limited_english_proficiency]
    csv << ['Home Language', student.home_language]
    csv << []
  end
end

