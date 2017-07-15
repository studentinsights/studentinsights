use x2data
SELECT
  'local_id'
  'course_number',
  'school_local_id',
  'section_number',
  'term_local_id'
UNION ALL
SELECT
  STF_ID_LOCAL,
  CSK_COURSE_NUMBER,
  SKL_SCHOOL_ID,
  MST_COURSE_VIEW,
  MST_TERM_VIEW
FROM district_school_year_context
LEFT JOIN SCHEDULE
  ON district_school_year_context.CTX_OID = schedule.SCH_CTX_OID
LEFT JOIN schedule_master
  ON schedule.SCH_OID = schedule_master.MST_SCH_OID
LEFT JOIN course_school
  ON schedule_master.MST_CSK_OID = course_school.CSK_OID
LEFT JOIN school
  ON course_school.CSK_SKL_OID = school.SKL_OID
LEFT JOIN staff
  ON schedule_master.MST_STF_OID_PRIMARY = staff.STF_OID
AND CTX_SCHOOL_YEAR=2017
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/educator_section_assignment_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'

