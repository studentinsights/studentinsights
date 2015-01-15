class DataSet

  REQUIRED_HEADERS = [

      # X2
      "NewID",
      "Grade",
      "HispanicLatino",
      "Race",
      "Limited English Prof",
      "Low Income",

      # MCAS
      "sped_off",
      "escaleds",
      "eperf2",
      "esgp",
      "mscaleds",
      "mperf2",
      "msgp"

  ]

  HEADER_DICTIONARY = {

      # X2
      "NewID" => :new_id,
      "Grade" => :grade,
      "HispanicLatino" => :hispanic_latino,
      "Race" => :race,
      "Limited English Prof" => :limited_english,
      "Low Income" => :low_income,

      # MCAS
      "sped_off" => :sped,
      "escaleds" => :ela_scaled,
      "eperf2" => :ela_performance,
      "esgp" => :ela_growth,
      "mscaleds" => :math_scaled,
      "mperf2" => :math_performance,
      "msgp" => :math_growth

  }

  TO_BOOLEAN = { 
    0.0 => false, 
    1.0 => true,
    "FALSE" => false,
    "TRUE" => true
  }

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
        if REQUIRED_HEADERS.include? header
          # puts header

          (first_row..last_row).each do |r|
            new_id = sheet.cell(r, new_id_column)
            student = Student.where(new_id: new_id).first_or_create(new_id: new_id)

            attribute = HEADER_DICTIONARY[header]
            value = sheet.cell(r, c)

            case attribute
            when :hispanic_latino, :limited_english, :low_income, :sped
              cast_value = TO_BOOLEAN[value]
            when :ela_scaled, :ela_growth, :math_scaled, :math_growth
              cast_value = value.to_i
            else
              cast_value = value
            end

            student.send("#{attribute}=", cast_value)
            # puts "Student ##{new_id} has #{attribute} of #{cast_value} (#{cast_value.class})"
            student.save
          end
        end
      end
    end 
  end
end