SELECT * FROM student
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/student_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM person
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/person_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM staff
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/staff_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM school
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/school_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM user_info
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/user_info_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM student_conduct_incident
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/student_conduct_incident_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM student_attendance
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/student_attendance_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';

SELECT * FROM student_assessment
  INTO OUTFILE "E:/_BACKUP_MYSQL/CodeForAmerica/student_assessment_table.txt"
  FIELDS TERMINATED BY ','
  ENCLOSED BY '"'
  LINES TERMINATED BY '\r\n';
