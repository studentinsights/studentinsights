use x2data
SELECT
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
WHERE STD_ENROLLMENT_STATUS = 'Active'
AND STD_ID_STATE IS NOT NULL
AND STD_OID IS NOT NULL
  INTO OUTFILE "E:\_BACKUP_MYSQL\CodeForAmerica"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
