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

  def self.import_all(options = {})
    import_classes.each do |i|
      begin
        i.new(options).connect_and_import
      rescue Exception => message
        puts message
      end
    end
  end

  # SCOPED IMPORT #

  def import_if_in_school_scope(row)
    if @school.local_id == row[:school_local_id]
      import_row row
    end
  end

  def import_if_in_summer_school(row)
    if @summer_school_local_ids.include? row[:local_id]
      import_row row
    end
  end

  # PROGRESS BAR #

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
