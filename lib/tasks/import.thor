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
require_relative '../../app/importers/constants/file_importer_options'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    class_option :district,
      type: :string,
      desc: "School district you're importing for"
    class_option :school,
      type: :array,
      aliases: "-s",
      desc: "Scope by school local IDs"
    class_option :source,
      type: :array,
      default: FileImporterOptions.options.keys,  # This runs all X2 and STAR importers
      desc: "Import data from the specified source: #{FileImporterOptions.options.keys}"
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

    def print_final_report
      report.print_final_report
    end
  end
end
