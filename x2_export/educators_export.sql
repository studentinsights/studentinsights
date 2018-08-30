use x2data
SELECT
  'state_id',
  'local_id', -- deprecated, use login_name instead
  'full_name',
  'staff_type',
  'homeroom',
  'status',
  'login_name',
  'school_local_id'
UNION ALL
SELECT
  STF_ID_STATE,
  STF_ID_LOCAL, -- deprecated, use login_name instead
  stf_name_view,
  STF_STAFF_TYPE,
  STF_HOMEROOM,
  STF_STATUS,
  USR_LOGIN_NAME,
  SKL_SCHOOL_ID
FROM staff
INNER JOIN school
  ON staff.STF_SKL_OID=school.SKL_OID
INNER JOIN person
  ON staff.STF_PSN_OID=person.PSN_OID
INNER JOIN user_info
  ON person.PSN_OID=user_info.USR_PSN_OID
WHERE STF_STATUS = 'Active'
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/educators_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
