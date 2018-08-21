# class StudentSectionAssignmentRow < Struct.new(:row, :school_ids_dictionary, :student_ids_map)
#   # Represents a row in a CSV export from Somerville's Aspen X2 student information system.
#   # This structure represents student section assignments.
#   #
#   # Expects the following headers:
#   #
#   #   :local_id, :course_number, :school_local_id, :section_number,
#   #   :term_local_id
#   #
#   # Eventually this will also include the letter grade for graded courses

#   # Matches a row from a CSV export with an existing or new (unsaved) Insights record
#   # Returns nil if something about the CSV row is invalid and it can't process the row.
#   def matching_insights_record_for_row
#     student_id = find_student_id
#     if student_id.nil?
#       @invalid_studentcount += 1
#       return nil
#     end

#     course = find_course
#     if course.nil?
#       @invalid_course_count +=1
#       return nil
#     end

#     section = find_section
#     if section.nil?
#       @invalid_section_count +=1
#       return nil
#     end

#     StudentSectionAssignment.find_or_initialize_by({
#       student_id: student_id,
#       section: section
#     })
#   end

#   def find_student_id
#     return nil unless row[:local_id]
#     student_ids_map.lookup_student_id(row[:local_id])
#   end

#   def find_course
#     return nil unless row[:course_number]

#     school_local_id = row[:school_local_id]
#     school_id = school_ids_dictionary[school_local_id]

#     Course.find_by(course_number: row[:course_number], school_id: school_id)
#   end

#   def find_section
#     return nil unless row[:section_number]

#     Section.find_by(
#       section_number: row[:section_number],
#       course: course,
#       term_local_id: row[:term_local_id]
#     )
#   end
# end
