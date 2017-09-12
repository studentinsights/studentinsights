class StudentSectionGradesImporter < Struct.new :school_scope, :client, :log, :progress_bar
  
    def remote_file_name
      'student_averages_export.txt'
    end
  
    def data_transformer
      CsvTransformer.new(['section_number','student_local_id','school_local_id','course_number','term_local_id','grade'])
    end
  
    def filter
      SchoolFilter.new(school_scope)
    end
  
    def import_row(row)
      student_section_assignment = StudentSectionGradeRow.new(row).build
      if student_section_assignment
        student_section_assignment.save!
      else
        log.write("Student Section Assignment Import invalid row: #{row}")
      end
    end
  
  end