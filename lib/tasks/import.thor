require 'thor'
require_relative '../../app/importers/settings/somerville_star_importers'
require_relative '../../app/importers/settings/somerville_x2_importers'

class Import
  class Start < Thor::Group
    desc "Import data into your Student Insights instance"

    SCHOOL_SHORTCODE_EXPANSIONS = {
      "ELEM" => %w[BRN HEA KDY AFAS ESCS WSNS WHCS]
    }

    class_option :school,
      type: :array,
      aliases: "-s",
      desc: "Scope by school local IDs; use ELEM to import all elementary schools"
    class_option :first_time,
      type: :boolean,
      desc: "Fill up an empty database"

    SOURCE_IMPORTERS = {
      "x2" => SomervilleX2Importers,
      "star" => SomervilleStarImporters,
    }

    class_option :source,
      type: :array,
      default: ["x2", "star"],
      desc: "Import data from the specified source: #{SOURCE_IMPORTERS.keys}"

    no_commands do
      def report
        # Kick up a new report helper object
        @report ||= ImportTaskReport.new([
          Student, StudentAssessment, DisciplineIncident, Absence, Tardy, Educator, School
        ])
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
      # Create Somerville schools from seed file if they are missing
      School.seed_somerville_schools if School.count == 0

      # Make sure school exists in database if school scope is set and refers
      # to a particular school. No need to check if scope is all elementary schools.
      school_local_ids.each { |id| School.find_by!(local_id: id) }
    end

    def connect_transform_import
      # X2 importers to come first because they are the sole source of truth about students.
      # STAR importers don't import students, they only import STAR results.

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
