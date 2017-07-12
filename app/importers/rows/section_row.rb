class SectionRow < Struct.new(:row, :school_ids_dictionary, :course_id)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents sections.
  #
  # Expects the following headers:
  #
  #   :course_number, :course_description, :school_local_id, 
  #   :section_number, :term_local_id, :section_schedule,
  #   :section_room_number
  
  def self.build(row)
    new(row).build
  end

  def build
    section = Section.find_or_initialize_by(section_number: row[:section_number], 
                                            course_id: course_id, 
                                            term_local_id: row[:term_local_id], 
                                            school_id: school_rails_id)
    section.schedule = row[:section_schedule]
    section.room_number = row[:section_room_number]
    return section
  end

  def school_local_id
    row[:school_local_id]
  end

  def school_rails_id
    school_ids_dictionary[school_local_id] if school_local_id.present?
  end
end
