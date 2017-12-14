class FileImporterOptions

  def self.keys
    [
      'x2',
      'star',
      'students',
      'assessments',
      'behavior',
      'educators',
      'attendance',
      'courses_sections',
      'student_section_assignments',
      'student_section_grades',
      'educator_section_assignments',
      'star_math',
      'star_reading',
    ]
  end

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
