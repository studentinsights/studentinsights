require 'thor'
require_relative '../../app/importers/file_importers/students_importer'
require_relative '../../app/importers/file_importers/x2_assessment_importer'
require_relative '../../app/importers/file_importers/behavior_importer'
require_relative '../../app/importers/file_importers/educators_importer'
require_relative '../../app/importers/file_importers/attendance_importer'
require_relative '../../app/importers/file_importers/courses_sections_importer'
require_relative '../../app/importers/file_importers/student_section_assignments_importer'
require_relative '../../app/importers/file_importers/student_section_grades_importer'
require_relative '../../app/importers/file_importers/educator_section_assignments_importer'
require_relative '../../app/importers/file_importers/star_reading_importer'
require_relative '../../app/importers/file_importers/star_math_importer'
require_relative '../../app/importers/constants/x2_importers'
require_relative '../../app/importers/constants/star_importers'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    FILE_IMPORTER_OPTIONS = {
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
      StarMathImporter::RecentImporter => 6,
      StarReadingImporter::RecentImporter => 6,
    }

    class_option :district,
      type: :string,
      desc: "School district you're importing for"
    class_option :school,
      type: :array,
      aliases: "-s",
      desc: "Scope by school local IDs"
    class_option :source,
      type: :array,
      default: FILE_IMPORTER_OPTIONS.keys,  # This runs all X2 and STAR importers
      desc: "Import data from the specified source: #{FILE_IMPORTER_OPTIONS.keys}"
    class_option :test_mode,
      type: :boolean,
      default: false,
      desc: "Redirect log output away from STDOUT; do not load Rails during import"
    class_option :progress_bar,
      type: :boolean,
      default: false,
      desc: "Show a progress bar for CSV reading (useful in development)"

    no_commands do
      def report
        models = [ Student, StudentAssessment, DisciplineIncident, Absence, Tardy, Educator, School, Course, Section, StudentSectionAssignment, EducatorSectionAssignment ]

        log = options["test_mode"] ? LogHelper::Redirect.instance.file : STDOUT

        @report ||= ImportTaskReport.new(
          models_for_report: models,
          record: record,
          log: log,
        )
      end

      def record
        @record ||= ImportRecord.create(time_started: DateTime.current)
      end

      def file_import_classes(sources = options["source"])
        import_classes = sources.map { |s| FILE_IMPORTER_OPTIONS.fetch(s, nil) }
                                .flatten
                                .compact
                                .uniq
      end

      def sorted_file_import_classes(import_classes = file_import_classes)
        import_classes.sort_by do |import_class|
          [PRIORITY.fetch(import_class, 100), import_class.to_s]
        end
      end

    end

    def validate_district_option
      district = options["district"]

      if !(district == "Somerville" || district == "New Bedford")
        raise "Unknown district!"
      end
    end

    def load_rails
      require File.expand_path("../../../config/environment.rb", __FILE__) unless options["test_mode"]
    end

    def seed_schools_if_needed
      if School.count == 0
        case options["district"]
        when "Somerville"
          School.seed_somerville_schools
        when "New Bedford"
          School.seed_new_bedford_schools
        end
      end
    end

    def print_initial_report
      report.print_initial_report
    end

    def connect_transform_import
      task = ImportTask.new(
        district: options["district"],
        school: options["school"],
        source: options["source"],
        test_mode: options["test_mode"],
        progress_bar: options["progress_bar"],
        record: record,
        file_import_classes: sorted_file_import_classes
      )

      task.connect_transform_import
    end

    def run_update_tasks
      begin
        Student.update_risk_levels!
        Student.update_recent_student_assessments
        Homeroom.destroy_empty_homerooms
      rescue => error
        ErrorMailer.error_report(error).deliver_now if Rails.env.production?
        raise error
      end
    end

    def print_final_report
      report.print_final_report
    end
  end
end
