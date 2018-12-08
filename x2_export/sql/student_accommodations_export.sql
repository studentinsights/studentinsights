use x2data
SELECT
  'student_state_id',
  'student_local_id', 
  'school_local_id',
  'iac_oid', -- primary key
  'iac_sep_oid', -- ed plan key
  'iac_content_area',
  'iac_category',
  'iac_type',
  'iac_description',
  'iac_field',
  'iac_last_modified',
  'iac_name'
UNION ALL
SELECT
  STD_ID_STATE,
  STD_ID_LOCAL,
  SKL_SCHOOL_ID,
  IAC_OID, 
  IAC_SEP_OID, 
  IAC_CONTENT_AREA,
  IAC_CATEGORY,
  IAC_TYPE,
  IAC_DESCRIPTION,
  IAC_FIELDD_001,
  IAC_LAST_MODIFIED,
  IAC_NAME
FROM student_accommodation
LEFT JOIN student_ed_plan ON student_accommodation.IAC_SEP_OID = student_ed_plan.SEP_OID
LEFT JOIN data_dictionary_extended
  ON student_ed_plan.SEP_DDX_OID = data_dictionary_extended.DDX_OID
INNER JOIN student
  ON student.STD_OID=student_ed_plan.SEP_STD_OID
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
  AND data_dictionary_extended.DDX_NAME = '504 Plan'
INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/student_accommodations_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'

