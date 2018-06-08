class UnwrapFileImporterOptions

  PRIORITY = {
    EducatorsImporter => 0,
    CoursesSectionsImporter => 1,
    EducatorSectionAssignmentsImporter => 2,
    StudentsImporter => 3,
    StudentSectionAssignmentsImporter => 4,
    BehaviorImporter => 5,
    AttendanceImporter => 5,
    StudentSectionGradesImporter => 5,
    X2AssessmentImporter => 6,
    StarMathImporter => 6,
    StarReadingImporter => 6,
  }

  def initialize(source)
    @source = source
  end

  def sort_file_import_classes
    file_import_classes.sort_by do |import_class|
      [
        PRIORITY.fetch(import_class, 100),    # First sort by priority ...
        import_class.to_s                     # ... then alphabetically.
      ]
    end
  end

  private

  def file_import_classes
    @source.map { |s| FileImporterOptions.options.fetch(s, nil) }
           .flatten
           .compact
           .uniq
  end

end
