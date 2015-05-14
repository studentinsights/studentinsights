SELECT
  'state_id',
  'incident_code',
  'incident_date',
  'incident_time',
  'incident_location',
  'incident_description'
UNION ALL
SELECT
  STD_ID_STATE,
  CND_INCIDENT_CODE,
  CND_INCIDENT_DATE,
  CND_INCIDENT_TIME,
  CND_INCIDENT_LOCATION,
  CND_INCIDENT_DESCRIPTION
FROM student
INNER JOIN student_conduct_incident
  ON student.STD_OID=student_conduct_incident.CND_STD_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE 'C:/CodeForAmerica/attendance_export.txt'
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
