class ProgressBar

  attr_accessor :total_size, :file_name

  def initialize(total_size, file_name)
    @total_size = total_size
    @file_name = file_name
  end

  def current_status(n)
    fractional_progress = (n.to_f / @total_size.to_f)
    percentage_progress = (fractional_progress * 100).to_i.to_s + "%"

    line_fill_part, line_empty_part = "", ""
    line_progress = (fractional_progress * 40).to_i

    line_progress.times { line_fill_part += "=" }
    (40 - line_progress).times { line_empty_part += " " }

    header = "#{@file_name}"
    filler_space = ' ' * (24 - @file_name.size)
    bar_body = "[#{line_fill_part}#{line_empty_part}] "
    progress_text = "#{percentage_progress} (#{n} out of #{@total_size}) "

    "\r " + header + filler_space + bar_body + '  ' + progress_text
  end
end
