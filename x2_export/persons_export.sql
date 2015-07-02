use x2data
SELECT
  'state_id',
  'local_id', -- LASID
  'school_local_id'
  'first_name',
  'last_name',
  'gender',
  'phone_1',
  'phone_2',
  'phone_3',
  'email_1',
  'email_2'
UNION ALL
SELECT
  STD_ID_STATE,
  STD_ID_LOCAL,
  SKL_SCHOOL_ID,
  PSN_NAME_FIRST,
  PSN_NAME_LAST,
  PSN_GENDER_CODE,
  PSN_PHONE_01,
  PSN_PHONE_02,
  PSN_PHONE_03,
  PSN_EMAIL_01,
  PSN_EMAIL_02
FROM person
INNER JOIN student
  ON student.STD_PSN_OID = person.PSN_OID
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/persons_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
