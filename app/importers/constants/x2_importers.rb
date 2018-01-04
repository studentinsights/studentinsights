class X2Importers

  def self.list
    [
      StudentsImporter,
      X2AssessmentImporter,
      BehaviorImporter,
      EducatorsImporter,
      AttendanceImporter,
      CoursesSectionsImporter,
      StudentSectionAssignmentsImporter,
      StudentSectionGradesImporter,
      EducatorSectionAssignmentsImporter,
    ]
  end

end
