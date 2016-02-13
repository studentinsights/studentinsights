require_relative '../../lib/analyze_student_attendance'

analysis = AnalyzeStudentAttendance.new(File.expand_path(PATH, __FILE__))

indicators = [ :att_tardy_ind, :att_tardy_ind_02,
               :att_dismissed_ind, :att_dismissed_ind_02,
               :att_excused_ind, :att_excused_ind_02,
               :att_absent_ind, :att_absent_ind_02 ]

              # From the Aspen / X2 data dictionary:

              # ATT_ABSENT_IND => Absent?
              # ATT_ABSENT_IND_02 => Absent PM?
              # ATT_DISMISSED_IND => Dismissed?
              # ATT_DISMISSED_IND_02 => Dismissed PM?
              # ATT_EXCUSED_IND => Excused?
              # ATT_EXCUSED_IND_02 => Excused PM?
              # ATT_TARDY_IND => Tardy?
              # ATT_TARDY_IND_02 => Tardy PM?

puts 'COUNTS FOR INDICATOR == "1" (TRUE)'; puts
indicators.map do |indicator|
  puts analysis.count_versus_total(indicator, '1')
end

puts; puts

puts 'COUNTS FOR INDICATOR == "0" (FALSE)'; puts
indicators.map do |indicator|
  puts analysis.count_versus_total(indicator, '0')
end


# Results -->

# COUNTS FOR INDICATOR == "1" (TRUE)

# att_tardy_ind         => 796938 out of 1875435    42.49%
# att_tardy_ind_02      => 0 out of 1875435         0%
# att_dismissed_ind     => 180567 out of 1875435    9.63%
# att_dismissed_ind_02  => 0 out of 1875435         0%
# att_excused_ind       => 84271 out of 1875435     4.49%
# att_excused_ind_02    => 0 out of 1875435         0%
# att_absent_ind        => 856361 out of 1875435    45.66%
# att_absent_ind_02     => 0 out of 1875435         0%

# Tardies + Absences:                               88.15%
# Tardies + Absences + Dismissed:                   97.78%
# Tardies + Absences + Dismissed + Excused:         102.27%


# COUNTS FOR INDICATOR == "0" (FALSE)

# att_tardy_ind         => 1078497 out of 1875435   57.50%
# att_tardy_ind_02      => 1875435 out of 1875435   100%
# att_dismissed_ind     => 1694868 out of 1875435   90.37%
# att_dismissed_ind_02  => 1875435 out of 1875435   100%
# att_excused_ind       => 1791164 out of 1875435   95.50%
# att_excused_ind_02    => 1875435 out of 1875435   100%
# att_absent_ind        => 1019074 out of 1875435   54.34%
# att_absent_ind_02     => 1875435 out of 1875435   100%
