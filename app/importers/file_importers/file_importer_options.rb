# typed: true
class FileImporterOptions
  # Describe all configured importers
  def all_importer_keys
    key_to_importers.keys.sort
  end

  # For describing all data flows and showing to users
  def all_data_flows
    data_flows = []
    key_to_importers().each do |key, maybe_importer_class|
      next if maybe_importer_class.respond_to?(:size)
      raise "missing #{maybe_importer_class.name}.data_flow method" unless maybe_importer_class.respond_to?(:data_flow)
      data_flows << maybe_importer_class.data_flow
    end
    data_flows
  end

  # Given a set of importer_keys to run, map them to classes
  # then order them by priority
  def prioritized_file_importer_classes(importer_keys)
    importer_classes = importer_keys
      .map {|s| key_to_importers.fetch(s) }
      .flatten
      .uniq

    # Sort by priority then alphabetically to break ties consistently
    importer_classes.sort_by do |import_class|
      [
        priority_map.fetch(import_class, 100),
        import_class.to_s
      ]
    end
  end

  private
  # Map a key to an unordered list of importers
  def key_to_importers
    {
      'x2' => [
        StudentsImporter,
        X2AssessmentImporter,
        BehaviorImporter,
        EducatorsImporter,
        AttendanceImporter,
        CoursesSectionsImporter,
        StudentSectionAssignmentsImporter,
        StudentSectionGradesImporter,
        EducatorSectionAssignmentsImporter,
        EdPlansImporter,
        EdPlanAccommodationsImporter
      ],
      'star' => [
        StarReadingImporter,
        StarMathImporter
      ],
      'students' => StudentsImporter,
      'assessments' => X2AssessmentImporter,
      'behavior' => BehaviorImporter,
      'educators' => EducatorsImporter,
      'attendance' => AttendanceImporter,
      'courses_sections' => CoursesSectionsImporter,
      'student_section_assignments' => StudentSectionAssignmentsImporter,
      'student_section_grades' => StudentSectionGradesImporter,
      'educator_section_assignments' => EducatorSectionAssignmentsImporter,
      'star_math' => StarMathImporter,
      'star_reading' => StarReadingImporter,
      'ed_plans' => EdPlansImporter,
      'ed_plan_accommodations' => EdPlanAccommodationsImporter,
      '504' => [
        EdPlansImporter,
        EdPlanAccommodationsImporter
      ]
    }
  end

  # Regardless of the order on the command line, enforce this execution
  # order since there are often interdependencies, and failures in certain
  # importers are more critical than others.
  #
  # Some of these are circular for a first-time run - eg, StudentsImporter creates Homeroom records, and
  # EducatorsImporter matches on those.
  def priority_map
    {
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
      EdPlansImporter => 7,
      EdPlanAccommodationsImporter => 8
    }
  end
end
