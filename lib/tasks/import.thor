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

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    DEFAULT_SCHOOLS = [
      'HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS', 'FC', 'CAP'
    ]

    SCHOOL_SHORTCODE_EXPANSIONS = {
      "ELEM" => %w[BRN HEA KDY AFAS ESCS WSNS WHCS]
    }

    X2_IMPORTERS = [
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

    STAR_IMPORTERS = [
      StarReadingImporter::RecentImporter,
      StarMathImporter::RecentImporter,
    ]

    FILE_IMPORTER_OPTIONS = {
      'x2' => X2_IMPORTERS,
      'star' => STAR_IMPORTERS,
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

    class_option :school,
      type: :array,
      default: DEFAULT_SCHOOLS,
      aliases: "-s",
      desc: "Scope by school local IDs; use ELEM to import all elementary schools"
    class_option :first_time,
      type: :boolean,
      desc: "Fill up an empty database"
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

      def file_import_class_to_client(import_class)
        return SftpClient.for_x2 if import_class.in?(X2_IMPORTERS)

        return SftpClient.for_star if import_class.in?(STAR_IMPORTERS)

        return nil
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

      def school_local_ids(schools = options["school"])
        schools.flat_map { |s| SCHOOL_SHORTCODE_EXPANSIONS.fetch(s, s) }.uniq
      end
    end

    def load_rails
      require File.expand_path("../../../config/environment.rb", __FILE__) unless options["test_mode"]
    end

    def set_up_initial_record
      record
    end

    def print_initial_report
      report.print_initial_report
    end

    def validate_schools
      School.seed_somerville_schools if School.count == 0
      school_local_ids.each { |id| School.find_by!(local_id: id) }
    end

    def connect_transform_import
      log = options["test_mode"] ? LogHelper::Redirect.instance.file : STDOUT
      school = options["school"]
      progress_bar = options["progress_bar"]

      timing_log = []

      sorted_file_import_classes.each do |file_import_class|
        import_record_detail = ImportRecordDetail.create(importer: file_import_class.name)
        file_importer = file_import_class.new(
          school,
          file_import_class_to_client(file_import_class),
          log,
          progress_bar,
          import_record_detail,
        )

        timing_data = { importer: file_importer.class.name, start_time: Time.current }

        begin
          file_importer.import
        rescue => error
          puts "🚨  🚨  🚨  🚨  🚨  Error! #{error}" unless Rails.env.test?

          extra_info =  { "importer" => file_importer.class.name }
          import_record_detail.fail(error)
          ErrorMailer.error_report(error, extra_info).deliver_now if Rails.env.production?
        end

        timing_data[:end_time] = Time.current
        timing_log << timing_data
        record.importer_timing_json = timing_log.to_json

        record.save!
      end
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

    def record_end_time
      record.time_ended = DateTime.current
      record.save
    end
  end
end
