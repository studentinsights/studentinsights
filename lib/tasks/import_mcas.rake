desc "Import MCAS data from csv"

task :import_mcas => :environment do

  require 'csv'
  require 'data_helpers'

  path = "#{Rails.root}/data/mcas.csv"
  Student.destroy_all
  @number_of_students = 0

  if File.exist? path
    csv = CSV.read(path)
    headers = csv[0]
    header_indicies = {} 
    last_row = csv.size - 1
    headers.each do |h|                         # Gather relevant headers, get their indices, store in hash
      if DataHelper::MCAS_HEADERS.include? h
        header_index = headers.index(h)
        new_name = DataHelper::HEADER_DICTIONARY[h]
        header_indicies[header_index] = new_name
      end
    end
    columns_to_get = header_indicies.keys
    state_identifier_index = header_indicies.key(:state_identifier)
    lep_index = header_indicies.key(:limited_english_proficient)
    flep_index = header_indicies.key(:former_limited_english_proficient)

    (1..last_row).each do |row_index| 
      row = csv[row_index]
      state_identifier = row[state_identifier_index]
      if state_identifier.present?
        new_student = Student.new
        columns_to_get.each do |c|
          attribute_name = header_indicies[c]
          if attribute_name == :limited_english_proficient || attribute_name == :former_limited_english_proficient
            value = DataHelper::TO_BOOLEAN[row[c]]
          else
            value = row[c]
          end
          new_student.send("#{attribute_name}=", value)
        end

        if new_student.save
          @number_of_students += 1
        end
      end
    end
  end
  puts "#{@number_of_students} students created."
  # puts "#{Student.where(limited_english:"FLEP").size} FLEP students."
  # puts "#{Student.where(limited_english:"LEP").size} LEP students."
end