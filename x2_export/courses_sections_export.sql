use x2data
SELECT
  'course_number',
  'course_description',
  'school_local_id',
  'section_number',
  'term_local_id',
  'section_schedule',
  'section_room_number'
UNION ALL
SELECT
  CSK_COURSE_NUMBER,
  CSK_COURSE_DESCRIPTION,
  SKL_SCHOOL_ID,
  MST_COURSE_VIEW,
  MST_TERM_VIEW,
  MST_SCHEDULE_DISPLAY,
  MST_ROOM_VIEW
FROM district_school_year_context
LEFT JOIN SCHEDULE
  ON district_school_year_context.CTX_OID = schedule.SCH_CTX_OID
LEFT JOIN schedule_master
  ON schedule.SCH_OID = schedule_master.MST_SCH_OID
LEFT JOIN course_school
  ON schedule_master.MST_CSK_OID = course_school.CSK_OID
INNER JOIN school
  ON course_school.CSK_SKL_OID = school.SKL_OID
AND CTX_SCHOOL_YEAR=2018
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/courses_sections_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'

