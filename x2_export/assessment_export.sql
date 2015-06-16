use x2data
SELECT
  'state_id',
  'school_local_id',
  'assessment_id',
  'assessment_date',
  'assessment_scale_score',
  'assessment_perf_level',
  'assessment_name',
  'assessment_subject',
  'assessment_test'
UNION ALL
SELECT DISTINCT
  ASM_STD_OID,
  ASM_SKL_OID,
  ASM_ASD_OID,
  ASM_DATE,
  ASM_SCALE_SCORE,
  ASM_PERFORMANCE_LEVEL,
  ASD_NAME,
  ASD_SUBJECT,
  SUBSTRING_INDEX(SUBSTRING_INDEX(ASD_NAME, ' ', 1), ' ', -1) as ASD_TEST
FROM student_assessment
LEFT JOIN assessment_definition
  ON student_assessment.ASM_ASD_OID=assessment_definition.ASD_OID
INNER JOIN student
  ON student.STD_OID=student_assessment.ASM_STD_OID
INNER JOIN school
ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE "E:\_BACKUP_MYSQL\CodeForAmerica\assessment_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';
