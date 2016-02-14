require_relative '../../lib/analyze_student_attendance'

analysis = AnalyzeStudentAttendance.new(File.expand_path(PATH, __FILE__))

indicators = [ :att_tardy_ind, :att_tardy_ind_02,
               :att_dismissed_ind, :att_dismissed_ind_02,
               :att_excused_ind, :att_excused_ind_02,
               :att_absent_ind, :att_absent_ind_02 ]

puts 'COUNTS FOR INDICATOR == "1" (TRUE)'; puts
indicators.map do |indicator|
  puts analysis.count_versus_total(indicator, '1')
end

puts; puts

puts 'COUNTS FOR INDICATOR == "0" (FALSE)'; puts
indicators.map do |indicator|
  puts analysis.count_versus_total(indicator, '0')
end


# From the Aspen / X2 data dictionary:

# ATT_ABSENT_IND => Absent?
# ATT_ABSENT_IND_02 => Absent PM?
# ATT_DISMISSED_IND => Dismissed?
# ATT_DISMISSED_IND_02 => Dismissed PM?
# ATT_EXCUSED_IND => Excused?
# ATT_EXCUSED_IND_02 => Excused PM?
# ATT_TARDY_IND => Tardy?
# ATT_TARDY_IND_02 => Tardy PM?
