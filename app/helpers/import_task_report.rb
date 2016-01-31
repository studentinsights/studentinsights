class ImportTaskReport

  attr_accessor :models_for_report

  def initialize(models_for_report)
    @models_for_report = models_for_report
  end

  ## INITIAL REPORT ##

  def print_initial_report
    puts; puts "=== STARTING IMPORT TASK... ==="
    puts; puts "=== INITIAL DATABASE COUNTS ==="
    puts; puts initial_counts_report
  end

  def initial_counts_report
    models_for_report.map do |klass|
      count_report_for_class(klass)
    end
  end

  def initial_counts_hash
    models_for_report.map do |klass|
      [ klass.to_s, klass.count ]
    end.to_h
  end

  ## END OF TASK REPORTS ##

  def print_final_report
    puts; puts; puts "=== FINAL DATABASE COUNTS ==="
    puts; puts end_of_task_report(initial_counts_hash)
    puts; puts; puts "=== BY SCHOOL ==="
    puts by_school_report
  end

  def end_of_task_report(initial_counts_hash)
    models_for_report.map do |klass|
      initial_count = initial_counts_hash[klass.to_s]
      end_of_task_report_for_klass(klass, initial_count)
    end
  end

  def end_of_task_report_for_klass(klass, initial_count)
    klass_diff = klass.count - initial_count
    count_report_for_class(klass) + diff_report_for_class(klass_diff)
  end

  def by_school_report
    School.all.map do |school|
      [
        "=== #{school.name}",
        [Student, Educator].map { |klass| count_report_for_class_by_school(klass, school) },
        ''
      ]
    end
  end

  private

  def count_report_for_class_by_school(klass, school)
    "* #{humanize_class_name(klass).capitalize}: #{humanize_count(klass.where(school: school).count)} "
  end

  def count_report_for_class(klass)
    "* #{humanize_class_name(klass).capitalize}: #{humanize_count(klass.count)} "
  end

  def diff_report_for_class(klass_diff)
    "(#{diff_sign(klass_diff)}#{humanize_count(klass_diff)})"
  end

  def diff_sign(klass_diff)
    klass_diff >= 0 ? '+' : '-'
  end

  def humanize_class_name(klass)
    klass.to_s.pluralize.underscore.humanize
  end

  def humanize_count(count)
    ActionController::Base.helpers.number_with_delimiter(count, delimiter: ',')
  end

end
