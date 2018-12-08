use x2data
SELECT
  'student_state_id',
  'student_local_id', 
  'school_local_id',
  'sep_oid', -- primary key
  'sep_status',
  'sep_grade_level',
  'sep_effective_date',
  'sep_review_date',
  'sep_last_meeting_date',
  'sep_district_signed_date',
  'sep_parent_signed_date',
  'sep_end_date',
  'sep_last_modified',
  'sep_fieldd_001',
  'sep_fieldd_002',
  'sep_fieldd_003',
  'sep_fieldd_004',
  'sep_fieldd_005',
  'sep_fieldd_006',
  'sep_fieldd_007',
  'sep_fieldd_008',
  'sep_fieldd_009',
  'sep_fieldd_010',
  'sep_fieldd_011',
  'sep_fieldd_012',
  'sep_fieldd_013',
  'sep_fieldd_014'
UNION ALL
SELECT
  STD_ID_STATE,
  STD_ID_LOCAL,
  SKL_SCHOOL_ID,
  SEP_OID, /* pk */
  SEP_STATUS,
  SEP_GRADE_LEVEL,
  SEP_EFFECTIVE_DATE,
  SEP_REVIEW_DATE,
  SEP_LAST_MEETING_DATE,
  SEP_DISTRICT_SIGNED_DATE,
  SEP_PARENT_SIGNED_DATE,
  SEP_END_DATE,
  SEP_LAST_MODIFIED,
  SEP_FIELDD_001,
  SEP_FIELDD_002,
  SEP_FIELDD_003,
  SEP_FIELDD_004,
  SEP_FIELDD_005,
  SEP_FIELDD_006,
  SEP_FIELDD_007,
  SEP_FIELDD_008,
  SEP_FIELDD_009,
  SEP_FIELDD_010,
  SEP_FIELDD_011,
  SEP_FIELDD_012,
  SEP_FIELDD_013,
  SEP_FIELDD_014
FROM student_ed_plan
LEFT JOIN data_dictionary_extended
  ON student_ed_plan.SEP_DDX_OID = data_dictionary_extended.DDX_OID
INNER JOIN student
  ON student.STD_OID=student_ed_plan.SEP_STD_OID
INNER JOIN school
  ON student.STD_SKL_OID=school.SKL_OID
WHERE STD_ENROLLMENT_STATUS = 'Active'
  AND data_dictionary_extended.DDX_NAME = '504 Plan'
INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/student_ed_plan_export.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n'
