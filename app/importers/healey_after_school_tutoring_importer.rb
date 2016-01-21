class HealeyAfterSchoolTutoringImporter

  ATP_ROSTER_PATH = "#{Rails.root}/data/ATP\ Student\ Roster\ 2014-15.csv"
  ATP_INACTIVES_ROSTER_PATH = "#{Rails.root}/data/ATP\ Student\ Roster\ 2014-15 - Inactives.csv"

  def self.intervention_type
    InterventionType.find_by_name("After-School Tutoring (ATP)")
  end

  def self.intervention_type_id
    intervention_type.id
  end

  def self.files_exist?
    File.exist?(ATP_ROSTER_PATH) || File.exist?(ATP_INACTIVES_ROSTER_PATH)
  end

  def connect_transform_import_locally
    require 'csv'

    paths = [ATP_ROSTER_PATH, ATP_INACTIVES_ROSTER_PATH]
    paths.each do |path|
      CSV.read(path, headers: true, header_converters: :symbol)
        .delete_if { |row| row[:school] != 'Healey' }
        .each do |row|
          student = Student.find_by_local_id(row[:districtid])
          student.interventions << Intervention.create!(
            start_date: Date.new(2014, 9, 4),
            end_date: Date.new(2015, 6, 19),
            number_of_hours: row[:accum_hrs].to_i,
            student_id: student.id,
            intervention_type_id: HealeyAfterSchoolTutoringImporter.intervention_type_id
          ) if student.present?
      end
    end
  end

end
