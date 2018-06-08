class ImportTaskReport

  attr_accessor :models_for_report

  def initialize(models_for_report:, record:, log:)
    @models_for_report = models_for_report
    @record = record
    @log = log
    @initial_counts_hash = compute_initial_counts
  end

  def print_initial_counts_report
    initial_counts = models_for_report.map do |klass|
      count_report_for_class(klass, klass.count)
    end

    log("\n")
    log("=== INITIAL DATABASE COUNTS ===")
    log("\n")
    log(initial_counts)
  end

  def print_final_counts_report
    log("\n")
    log("\n")

    log("=== FINAL DATABASE COUNTS ===")
    log(end_of_task_report)
    log("\n")
    log("\n")

    log("=== BY SCHOOL ===")
    log(by_school_report)
    log("\n")
    log("\n")

    log("=== IMPORT TIMING ===")
    log(@record.importer_timing_json)
    log("\n")
    log("\n")

    log("=== ASSESSMENTS REPORT ===")
    AssessmentsReport.new(@log).print_report
    log("\n")
    log("\n")
  end

  private
  def compute_initial_counts
    models_for_report.map do |klass|
      [ klass.to_s, klass.count ]
    end.to_h
  end

  ## END OF TASK REPORTS ##

  def end_of_task_report
    models_for_report.map do |klass|
      initial_count = @initial_counts_hash[klass.to_s]
      end_of_task_report_for_klass(klass, initial_count)
    end
  end

  def end_of_task_report_for_klass(klass, initial_count)
    klass_count = klass.count
    count_report_for_class(klass, klass_count) + diff_report_for_class(klass_count - initial_count)
  end

  def by_school_report
    School.all.map do |school|
      [
        '',
        "=== #{school.name}",
        [Student, Educator].map do |klass|
          count = klass.where(school: school).count
          count_report_for_class(klass, count)
        end
      ]
    end
  end

  def count_report_for_class(klass, count)
    "* #{humanize_class_name(klass).capitalize}: #{humanize_count(count)} "
  end

  def diff_report_for_class(klass_diff)
    "(#{klass_diff >= 0 ? '+' : '-'}#{humanize_count(klass_diff)})"
  end

  def humanize_class_name(klass)
    klass.to_s.pluralize.underscore.humanize
  end

  def humanize_count(count)
    ActionController::Base.helpers.number_with_delimiter(count, delimiter: ',')
  end

  def log(msg)
    @log.puts "ImportTaskReport: #{msg}"
  end
end
