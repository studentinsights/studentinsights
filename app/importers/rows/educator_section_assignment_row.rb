class EducatorSectionAssignmentRow < Struct.new(:row, :school_ids_dictionary)
  # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
  # This structure represents student section assignments.
  #
  # Expects the following headers:
  #
  #   :local_id, :course_number, :school_local_id, :section_number, 
  #   :term_local_id
  #
  # Eventually this will also include the letter grade for graded courses

  
  def self.build(row)
    new(row).build
  end

  def build
    educator_section_assignment = EducatorSectionAssignment.find_or_initialize_by(educator: educator,
                                                                                section: section)
    return educator_section_assignment
  end

  def educator
    Educator.find_by_local_id!(row[:local_id])
  end

  def section
    Section.find_by_section_number!(row[:section_number])
  end

end
