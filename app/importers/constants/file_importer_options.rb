class FileImporterOptions
  class ImporterDescription
    attr_reader :priority
    attr_reader :key
    attr_reader :importer_class
    attr_reader :source

    def initialize(priority, key, importer_class, source)
      raise 'ImporterDescription key should match importer_class.name' unless key == importer_class.name

      @priority = priority
      @key = key
      @importer_class = importer_class
      @source = source
    end
  end

  # The priority order matters here, since some of these tasks are interdependent.  You should be careful
  # when changing them!
  def self.importer_descriptions
    [
      # Import work related to educator sign-in and authorization is first.
      ImporterDescription.new(110, 'EducatorsImporter', EducatorsImporter, :x2),
      ImporterDescription.new(200, 'CoursesSectionsImporter', CoursesSectionsImporter, :x2),
      ImporterDescription.new(210, 'EducatorSectionAssignmentsImporter', EducatorSectionAssignmentsImporter, :x2),

      # Then student data.
      ImporterDescription.new(220, 'StudentsImporter', StudentsImporter, :x2),
      ImporterDescription.new(230, 'StudentSectionAssignmentsImporter', StudentSectionAssignmentsImporter, :x2),

      # Then individual data points.
      ImporterDescription.new(310, 'BehaviorImporter', BehaviorImporter, :x2),
      ImporterDescription.new(320, 'AttendanceImporter', AttendanceImporter, :x2),
      ImporterDescription.new(330, 'StudentSectionGradesImporter', StudentSectionGradesImporter, :x2),
      ImporterDescription.new(340, 'X2AssessmentImporter', X2AssessmentImporter, :x2),
      ImporterDescription.new(400, 'StarMathImporter', StarMathImporter, :star),
      ImporterDescription.new(410, 'StarReadingImporter', StarReadingImporter, :star),
    ]
  end

  def self.ordered_by_priority(importers)
    importers.sort_by {|description| description.priority }
  end
end
