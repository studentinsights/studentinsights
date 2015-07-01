use x2data
SELECT
  'state_id',
  'local_id', -- LASID
  'incident_code',
  'event_date',
  'incident_time',
  'incident_location',
  'incident_description',
  'school_local_id'
UNION ALL
SELECT
  STD_ID_STATE,
  STD_ID_LOCAL,
  CND_INCIDENT_CODE,
  IF(sci.CND_INCIDENT_DATE > Date(Now()), NULL, sci.CND_INCIDENT_DATE) AS 'incident_date',
  CND_INCIDENT_TIME,
  CND_INCIDENT_LOCATION,
  REPLACE(REPLACE(CND_INCIDENT_DESCRIPTION,'"'," "), "\r\n", " "),
  SKL_SCHOOL_ID
FROM student
INNER JOIN student_conduct_incident sci
  ON student.STD_OID=sci.CND_STD_OID
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/behavior_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
