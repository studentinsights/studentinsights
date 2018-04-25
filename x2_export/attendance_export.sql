use x2data
SELECT
  'state_id',
  'local_id', -- LASID
  'absence',
  'tardy',
  'dismissed',
  'reason',
  'excused',
  'comment',
  'event_date',
  'school_local_id'
UNION ALL
SELECT
  STD_ID_STATE,
  STD_ID_LOCAL,
  ATT_ABSENT_IND,
  ATT_TARDY_IND,
  ATT_DISMISSED_IND,
  ATT_REASON_CODE,
  ATT_EXCUSED_IND,
  ATT_COMMENT,
  IF(sa.ATT_DATE > Date(Now()), NULL, sa.ATT_DATE) AS 'event_date',
  SKL_SCHOOL_ID
FROM student
INNER JOIN student_attendance sa
  ON student.STD_OID=sa.ATT_STD_OID
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/attendance_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
