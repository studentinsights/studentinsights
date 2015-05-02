after 'import:schools', 'import:x2', 'import:attendance' do
  puts "STAR:"
  healey_math_05_path = "#{Rails.root}/data/star_healey_math_05.csv"
  healey_reading_05_path = "#{Rails.root}/data/star_healey_reading_05.csv"

  if File.exist? healey_math_05_path
    puts "   Importing STAR math data..."
    importer = StarMathImporter.new(healey_math_05_path).import
    puts "      #{StarResult.all.size} STAR results."
  else
    puts "   No STAR data file found."
    puts "   #{StarResult.all.size} STAR results."
  end

  if File.exist? healey_reading_05_path
    puts "   Importing STAR reading data..."
    importer = StarReadingImporter.new(healey_reading_05_path).import
    puts "      #{StarResult.all.size} STAR Reading results."
  else
    puts "   No STAR data file found."
    puts "   #{StarResult.all.size} STAR results."
  end
end