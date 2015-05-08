-- CHECKS FOR UNIQUENESS

SELECT STD_OID, COUNT(*)
FROM student
GROUP BY STD_OID
HAVING COUNT(*) > 1
-- All unique values by STD_OID (as of 4/3/15 dump)

SELECT ATT_STD_OID, ATT_DATE, COUNT(*)
FROM student_attendance
GROUP BY ATT_STD_OID, ATT_DATE
HAVING COUNT(*) > 1
-- Duplicates exist: 65 rows out of 1,762,681, seem to be true duplicates (as of 4/3/15 dump)

SELECT CND_STD_OID, CND_INCIDENT_DATE, CND_INCIDENT_CODE, CND_INCIDENT_TIME, COUNT(*)
FROM student_conduct_incident
GROUP BY CND_STD_OID, CND_INCIDENT_DATE, CND_INCIDENT_CODE, CND_INCIDENT_TIME
HAVING COUNT(*) > 1
-- Duplicates exist: 261 rows out of 60259, some seem to be true duplicates (as of 4/3/15 dump)
