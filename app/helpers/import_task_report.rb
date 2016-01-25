class ImportTaskReport

  attr_accessor :models_for_report

  def initialize(models_for_report)
    @models_for_report = models_for_report
  end

  def humanize_class_name(klass)
    klass.to_s.pluralize.underscore.humanize
  end

  def humanize_count(count)
    ActionController::Base.helpers.number_with_delimiter(count, delimiter: ',')
  end

  def initial_counts_report
    models_for_report.map do |klass|
      "* #{humanize_class_name(klass).capitalize}: #{humanize_count(klass.count)}"
    end
  end

  def initial_counts_hash
    models_for_report.map do |klass|
      [ klass.to_s, klass.count ]
    end.to_h
  end

  def end_of_task_report(initial_counts_hash)
    models_for_report.map do |klass|
      initial_count = initial_counts_hash[klass.to_s]
      end_of_task_report_for_klass(klass, initial_count)
    end
  end

  def end_of_task_report_for_klass(klass, initial_count)
    klass_diff = klass.count - initial_count
    diff_sign = klass_diff >= 0 ? '+' : '-'
    "* #{humanize_class_name(klass).capitalize}: #{humanize_count(klass.count)} (#{diff_sign}#{humanize_count(klass_diff)})"
  end

end
