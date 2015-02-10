class DataSet

  def self.merge_sheets_and_write(xls)

    xls.each_with_pagename do |name, sheet|

      first_column = sheet.first_column
      last_column = sheet.last_column
      first_row = sheet.first_row
      last_row = sheet.last_row

      header_row = 1
      new_id_column = 1
      
      ((first_column + 1)..last_column).each do |c|
        header = sheet.cell(header_row, c)
        if ExcelHelpers::REQUIRED_HEADERS.include? header

          (first_row..last_row).each do |r|
            new_id = sheet.cell(r, new_id_column)
            student = Student.where(new_id: new_id).first_or_create(new_id: new_id.to_i)

            attribute = ExcelHelpers::HEADER_DICTIONARY[header]
            value = sheet.cell(r, c)

            case attribute
            when :access_progress
              cast_value = ExcelHelpers::TO_BOOLEAN[value]
            when :hispanic_latino, :sped
              cast_value = ExcelHelpers::TO_BOOLEAN[value]
            when :low_income
              cast_value = ExcelHelpers::FREE_REDUCED_LUNCH_TO_LOW_INCOME[value]
            when :limited_english
              if value == "FLEP"
                cast_value = "Formerly Limited"
              elsif value == ""
                cast_value = nil
              else
                cast_value = value
              end
            when :ela_scaled, :ela_growth, :math_scaled, :math_growth, :access_growth, :access_performance
              cast_value = value.to_i
              if cast_value == 0
                cast_value = nil
              end
            else
              if value.length > 0
                cast_value = value
              else
                cast_value = nil
              end
            end

            student.send("#{attribute}=", cast_value)
            student.save
          end
        end
      end
    end 
  end
end