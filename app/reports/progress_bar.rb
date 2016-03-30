class ProgressBar < Struct.new :log, :file_name, :total_units, :completed_units

  TOTAL_BAR_LENGTH = 40.freeze

  def print
    log.print(header + bar + progress_text)
  end

  private

  def header
    "\r #{file_name}#{padding_after_file_name}"
  end

  def padding_after_file_name
    ' ' * (24 - file_name.size)
  end

  def bar
    progress_bar_string = String.new
    bar_progress.times { progress_bar_string << '=' }
    bar_remainder.times { progress_bar_string << ' ' }
    "[#{progress_bar_string}]"
  end

  def bar_progress
    (fractional_progress * TOTAL_BAR_LENGTH).to_i
  end

  def fractional_progress
    completed_units.to_f / total_units.to_f
  end

  def bar_remainder
    TOTAL_BAR_LENGTH - bar_progress
  end

  def progress_text
    "  #{percentage_progress} (#{completed_units} out of #{total_units}) "
  end

  def percentage_progress
    (fractional_progress * 100).to_i.to_s + "%"
  end
end
