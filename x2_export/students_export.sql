SELECT
  'state_id',
  'full_name',
  'home_language',
  'grade',
  'homeroom',
  'school_local_id'
UNION ALL
SELECT
  STD_ID_STATE,
  std_name_view,
  STD_HOME_LANGUAGE_CODE,
  STD_GRADE_LEVEL,
  STD_HOMEROOM,
  SKL_SCHOOL_ID
FROM student
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE 'C:/CodeForAmerica/attendance_export.txt'
  FIELDS TERMINATED BY '\t'
  ENCLOSED BY '|'
  LINES TERMINATED BY '\r\n'
