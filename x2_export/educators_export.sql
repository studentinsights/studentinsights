use x2data
SELECT
  'state_id',
  'local_id',
  'full_name',
  'staff_type',
  'homeroom',
  'status',
  'school_local_id'
UNION ALL
SELECT
  STF_ID_STATE,
  STF_ID_LOCAL,
  stf_name_view,
  STF_STAFF_TYPE,
  STF_HOMEROOM,
  STF_STATUS,
  SKL_SCHOOL_ID
FROM staff
INNER JOIN school
  ON staff.STF_SKL_OID=school.SKL_OID
WHERE STF_STATUS = 'Active'
AND STF_ID_LOCAL IS NOT NULL
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/educators_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
