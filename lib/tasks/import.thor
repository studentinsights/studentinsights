require 'thor'
require_relative '../../app/importers/sources/somerville_star_importers'
require_relative '../../app/importers/sources/somerville_x2_importers'
require_relative '../../app/importers/file_importers/students_importer'
require_relative '../../app/importers/file_importers/x2_assessment_importer'
require_relative '../../app/importers/file_importers/behavior_importer'
require_relative '../../app/importers/file_importers/educators_importer'
require_relative '../../app/importers/file_importers/attendance_importer'
require_relative '../../app/importers/file_importers/courses_sections_importer'
require_relative '../../app/importers/file_importers/student_section_assignments_importer'
require_relative '../../app/importers/file_importers/student_section_grades_importer'
require_relative '../../app/importers/file_importers/educator_section_assignments_importer'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    SCHOOL_SHORTCODE_EXPANSIONS = {
      "ELEM" => %w[BRN HEA KDY AFAS ESCS WSNS WHCS]
    }

    SOURCE_IMPORTERS = {
      # X2 importers should come first because they are the sole source of truth about students.

      "x2" => SomervilleX2Importers,
      "star" => SomervilleStarImporters,
    }

    class_option :school,
      type: :array,
      default: ['HEA', 'WSNS', 'ESCS', 'BRN', 'KDY', 'AFAS', 'WHCS', 'SHS'],
      aliases: "-s",
      desc: "Scope by school local IDs; use ELEM to import all elementary schools"
    class_option :first_time,
      type: :boolean,
      desc: "Fill up an empty database"
    class_option :source,
      type: :array,
      default: SOURCE_IMPORTERS.keys,
      desc: "Import data from the specified source: #{SOURCE_IMPORTERS.keys}"
    class_option :x2_file_importers,
      type: :array,
      default: SomervilleX2Importers.file_importer_names,
      desc: "Import data from the specified files: #{SomervilleX2Importers.file_importer_names}"
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

      def importers(sources = options["source"])
        sources.map { |s| SOURCE_IMPORTERS.fetch(s, nil) }.compact.uniq
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
      timing_log = []

      file_importers = importers.flat_map { |i| i.new(options).file_importers }

      file_importers.each do |file_importer|
        timing_data = { importer: file_importer.class.name, start_time: Time.current }

        begin
          FileImport.new(file_importer).import
        rescue => error
          puts "🚨  🚨  🚨  🚨  🚨  Error! #{error}" unless Rails.env.test?

          extra_info =  { "importer" => file_importer.class.name }
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
        Educator.save_student_searchbar_json
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
