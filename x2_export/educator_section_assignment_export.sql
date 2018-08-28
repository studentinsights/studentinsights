use x2data
SELECT
  'local_id',
  'login_name',
  'course_number',
  'school_local_id',
  'section_number',
  'term_local_id'
UNION ALL
SELECT
  STF_ID_LOCAL,
  USR_LOGIN_NAME,
  CSK_COURSE_NUMBER,
  SKL_SCHOOL_ID,
  MST_COURSE_VIEW,
  MST_TERM_VIEW
FROM district_school_year_context
LEFT JOIN SCHEDULE
  ON district_school_year_context.CTX_OID = schedule.SCH_CTX_OID
LEFT JOIN schedule_master
  ON schedule.SCH_OID = schedule_master.MST_SCH_OID
LEFT JOIN schedule_master_teacher
  ON schedule_master.MST_OID = schedule_master_teacher.MTC_MST_OID
LEFT JOIN course_school
  ON schedule_master.MST_CSK_OID = course_school.CSK_OID
INNER JOIN school
  ON course_school.CSK_SKL_OID = school.SKL_OID
INNER JOIN staff
  ON schedule_master_teacher.MTC_STF_OID = staff.STF_OID
INNER JOIN person
  ON staff.STF_PSN_OID=person.PSN_OID
INNER JOIN user_info
  ON person.PSN_OID=user_info.USR_PSN_OID
AND CTX_SCHOOL_YEAR=2019 # when does the school year end?
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/educator_section_assignment_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'

