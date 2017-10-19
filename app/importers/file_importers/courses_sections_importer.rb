class CoursesSectionsImporter < BaseCsvImporter
  def remote_file_name
    'courses_sections_export.txt'
  end

  def school_ids_dictionary
    @dictionary ||= School.all.map { |school| [school.local_id, school.id] }.to_h
  end

  def import_row(row)
    course = CourseRow.new(row, school_ids_dictionary).build
    if course.school.present?
      if course.save
        section = SectionRow.new(row, school_ids_dictionary, course.id).build
        import_record_detail.log_action(section)
        section.save
      else
        import_record_detail.log_rejected("Course import invalid row: #{row}")
      end
    else
      import_record_detail.log_rejected("Course import invalid row missing school_local_id: #{row}")
    end
  end
end
