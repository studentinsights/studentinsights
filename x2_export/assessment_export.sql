use x2data
SELECT
  'state_id',
  'local_id', -- LASID
  'school_local_id',
  'assessment_date',
  'assessment_scale_score',
  'assessment_performance_level',
  'assessment_growth',
  'assessment_name',      -- Full, unedited assessment name. Example: "MCAS 2013 English Language Arts"
  'assessment_subject',   -- Assessment subject. Examples: "English Language Arts", "Mathematics"
  'assessment_test'       -- Assessment family. Examples: "MCAS", "MAP", "DIBELS"
UNION ALL
SELECT DISTINCT
  STD_ID_STATE,
  STD_ID_LOCAL,
  SKL_SCHOOL_ID,
  ASM_DATE,
  ASM_SCALE_SCORE,
  ASM_PERFORMANCE_LEVEL,
  REPLACE(ASM_FIELDB_001, "SGP: ", ""),  -- ASM_FIELDB_001 = growth score
  ASD_NAME,
  CASE SUBSTRING_INDEX(SUBSTRING_INDEX(ASD_NAME, ' ', 1), ' ', -1)
    WHEN 'WIDA-ACCESS' OR 'ACCESS' THEN REPLACE(SUBSTRING_INDEX(ASD_NAME, ' ', -1), "*", "")
    ELSE ASD_SUBJECT
    END AS ASD_SUBJECT,
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
