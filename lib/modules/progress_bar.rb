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

    return "\r #{@file_name} [#{line_fill_part}#{line_empty_part}] #{percentage_progress} (#{n} out of #{@total_size})"
  end
end
