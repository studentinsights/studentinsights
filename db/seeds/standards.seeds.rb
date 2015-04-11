if Standard.all.size == 0
  math_path = "#{Rails.root}/vendor/CC-math-0.8.0.json"
  math_standards = File.read(math_path)
  math_standards_parsed = JSON.parse(math_standards)

  lit_path = "#{Rails.root}/vendor/CC-literacy-0.8.0.json"
  lit_standards = File.read(lit_path)
  lit_standards_parsed = JSON.parse(lit_standards)
  
  [math_standards_parsed, lit_standards_parsed].each do |standards|
    standards.each do |standard|
      grades = standard["gradeLevels"]     
      if grades.present?
        if grades.include? "05"               # We only need standards that apply to 5th grade at this stage
          short_code = standard["shortCode"]
          statement = standard["statement"]
          ccss_info = standard["CCSS"]
          subject = standard["subject"]
          if short_code.present? && statement.present? && ccss_info.present?
            uri = ccss_info["URI"]
            Standard.create!(
              short_code: short_code, 
              uri: uri, 
              statement: statement,
              subject: subject
            )
          end
        end
      end
    end
  end
end