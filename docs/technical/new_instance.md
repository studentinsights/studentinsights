# Creating a new Insights instance
The overall idea is strong isolation across districts, which means some initial setup overhead.  Here's how you do it!  More detailed notes for various steps are below.

### 1: Stand up an instance
Goal: Visit the home page signed-out

- New Heroku app with Node/Ruby buildpacks, grant access to team
- Review and set environment variables (minimally)
- Review and update `PerDistrict.rb` class & district config YML (minimally)
- Update `scripts/deploy/all.sh`
- Set up Postgres and seed database (minimally, i.e. just schools)
- Set up Logentries
- Set up Rollbar
- Set up Mixpanel
- Set up CSP and CSP logger
- Add domain

### 2: Sign in
Goal: Sign in as developer, see empty home page, roster page, districtwide pages
- Create developer user

### 3: Import first data
Goal: Sign in as districtwide educator, use the home page, roster page, student profile page, take notes for students in support meetings
- Create a new EC2 instance for receiving data (maybe with static IPs, grant access to team): ask teammates for `new_sftp.md` doc
- Set `SIS_SFTP_HOST`, `SIS_SFTP_USER`, `SIS_SFTP_KEY` or `STAR_SFTP_PASSWORD`
- `EducatorsImporter` and validate
- `StudentsImporter` and validate
- Review permissions with district partner
- Set up Mailgun and enable usage emails
- Add Heroku scheduler jobs for import
- Add Heroku scheduler jobs for cached background tasks
- Test Heroku scheduler jobs

### 4: Enable additional features, or ensure disabled
Goal: Educators using additional feature (eg, "insights box" for absences) or using additional data within support meetings (eg BBST).
- Student photos (with AWS config, grant access to team)
- IEP PDFs (with AWS config, grant access to team)
- `AttendanceImporter` and validate
- `BehaviorImporter` and validate
- ACCESS and validate
- Next Gen MCAS and validate
- Old school MCAS and validate
- DIBELS and validate
- STAR and validate
- HS Courses and Sections for authorization
- HS grades
- Class lists
- Review `PerDistrict`

### 5: Final review
- Review ENV variables
- Review `PerDistrict`
- Review scheduled jobs
- Review Puma tuning (eg, WEB_CONCURRENCY)
- Load test or scale accordingly


