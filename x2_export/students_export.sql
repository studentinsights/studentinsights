use x2data
SELECT
  'state_id',
  'full_name',
  'home_language',
  'student_address',
  'grade',
  'registration_date',
  'free_reduced_lunch',
  'homeroom',
  'school_local_id'
UNION ALL
SELECT
  STD_ID_STATE,
  std_name_view,
  STD_HOME_LANGUAGE_CODE,
  STD_ADRS_VIEW,
  STD_GRADE_LEVEL,
  STD_FIELDA_081, -- Registration date
  STD_FIELDB_031, -- Free/reduced lunch status
  STD_HOMEROOM,
  SKL_SCHOOL_ID
FROM student
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/students_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
