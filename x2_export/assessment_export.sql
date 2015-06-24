use x2data
SELECT
  'state_id',
  'school_local_id',
  'assessment_date',
  'assessment_scale_score',
  'assessment_performance_level',
  'assessment_growth',
  'assessment_name',
  'assessment_subject',
  'assessment_test'
UNION ALL
SELECT DISTINCT
  STD_ID_STATE,
  SKL_SCHOOL_ID,
  ASM_DATE,
  ASM_SCALE_SCORE,
  ASM_PERFORMANCE_LEVEL,
  REPLACE(ASM_FIELDB_001, "SGP: ", ""),  -- ASM_FIELDB_001 = growth score
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
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/assessment_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';
