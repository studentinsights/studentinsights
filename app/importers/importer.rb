module Importer

  def self.import_classes
    [
      StudentsImporter,
      McasImporter,
      StarMathImporter,
      StarReadingImporter,
      BehaviorImporter,
      AttendanceImporter
    ]
  end

  def self.import_all(school_arg = {})
    import_classes.each do |i|
      begin
        i.new(school_arg).connect_and_import
      rescue Exception => message
        puts message
      end
    end
  end

  def count_number_of_rows(file)
    CSV.parse(file).size - 1
  end

  def progress_bar(n, length)
    fractional_progress = (n.to_f / length.to_f)
    percentage_progress = (fractional_progress * 100).to_i.to_s + "%"

    line_fill_part, line_empty_part = "", ""
    line_progress = (fractional_progress * 40).to_i

    line_progress.times { line_fill_part += "=" }
    (40 - line_progress).times { line_empty_part += " " }

    return "\r #{export_file_name} [#{line_fill_part}#{line_empty_part}] #{percentage_progress} (#{n} out of #{length})"
  end
end
