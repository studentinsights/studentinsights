class FileImporterOptions

  def self.options
    {
      'x2' => X2Importers.list,
      'star' => StarImporters.list,
      'students' => StudentsImporter,
      'assessments' => X2AssessmentImporter,
      'behavior' => BehaviorImporter,
      'educators' => EducatorsImporter,
      'attendance' => AttendanceImporter,
      'courses_sections' => CoursesSectionsImporter,
      'student_section_assignments' => StudentSectionAssignmentsImporter,
      'student_section_grades' => StudentSectionGradesImporter,
      'educator_section_assignments' => EducatorSectionAssignmentsImporter,
      'star_math' => StarMathImporter::RecentImporter,
      'star_reading' => StarReadingImporter::RecentImporter,
    }
  end

end
