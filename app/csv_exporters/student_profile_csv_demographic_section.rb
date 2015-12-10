class StudentProfileCsvDemographicSection < Struct.new :csv, :exporter
  delegate :data, to: :exporter

  def add
    csv << ['Demographics']
    csv << ['Program Assigned', data[:student].program_assigned]
    csv << ['504 Plan', data[:student].plan_504]
    csv << ['Placement', data[:student].sped_placement]
    csv << ['Disability', data[:student].disability]
    csv << ['Level of Need', data[:student].sped_level_of_need]
    csv << ['Language Fluency', data[:student].limited_english_proficiency]
    csv << ['Home Language', data[:student].home_language]
    csv << []
  end
end

