SELECT
  'state_id',
  'absence',
  'tardy',
  'event_date',
UNION ALL
SELECT
  STD_ID_STATE,
  ATT_ABSENT_IND,
  ATT_TARDY_IND,
  ATT_DATE
FROM student
INNER JOIN student_attendance
  ON student.STD_OID=student_attendance.ATT_STD_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE 'C:/CodeForAmerica/attendance_export.txt'
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
