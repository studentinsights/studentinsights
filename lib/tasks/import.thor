require 'thor'
require_relative '../../app/importers/settings/somerville_star_importers'
require_relative '../../app/importers/settings/somerville_x2_importers'
require_relative '../../app/importers/students_importer'
require_relative '../../app/importers/x2_assessment_importer'
require_relative '../../app/importers/behavior_importer'
require_relative '../../app/importers/educators_importer'
require_relative '../../app/importers/attendance_importer'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    SCHOOL_SHORTCODE_EXPANSIONS = {
      "ELEM" => %w[BRN HEA KDY AFAS ESCS WSNS WHCS]
    }

    SOURCE_IMPORTERS = {
      "x2" => SomervilleX2Importers,
      "star" => SomervilleStarImporters,
    }

    class_option :school,
      type: :array,
      default: ['HEA'],
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

    no_commands do
      def report
        models = [ Student, StudentAssessment, DisciplineIncident, Absence, Tardy, Educator, School ]
        @report ||= ImportTaskReport.new(models)
      end

      def importers(sources = options["source"])
        sources.map { |s| SOURCE_IMPORTERS.fetch(s, nil) }.compact.uniq
      end

      def school_local_ids(schools = options["school"])
        schools.flat_map { |s| SCHOOL_SHORTCODE_EXPANSIONS.fetch(s, s) }.uniq
      end
    end

    def load_rails
      require File.expand_path("../../../config/environment.rb", __FILE__)
    end

    def print_initial_report
      report.print_initial_report
    end

    def validate_schools
      School.seed_somerville_schools if School.count == 0
      school_local_ids.each { |id| School.find_by!(local_id: id) }
    end

    def connect_transform_import
      # X2 importers should come first because they are the sole source of truth about students.
      importers.flat_map { |i| i.from_options(options) }.each(&:connect_transform_import)
    end

    def run_update_tasks
      Student.update_risk_levels
      Student.update_student_school_years
      Student.update_recent_student_assessments
      Homeroom.destroy_empty_homerooms
    end

    def print_final_report
      report.print_final_report
    end
  end
end
