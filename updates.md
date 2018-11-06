{% include navbar.html %}

# Updates
Student Insights is entirely open source, which means that all code and all changes are published in the open.  We also aim to build in the open, and so much of our discussion about what to build and why is also published openly as well.  You can also read about how we protect the security and privacy of student data while building in the open and releasing all code publicly as open source.

This is stored on GitHub, and if you're new to open source a good starting point is to browse through recent pull requests to see what this looks like.  For most educators, this is too much information, so we also release a shorter summary of changes each week as a changelog.  We also use a work board to communicate about what we're working on right now, what's coming up soon, and potential projects a few months out.

If you'd like to collaborate with us, the best way to do this is to reach out over email and we can help you get started.  You can also join the local Code for Boston brigade on Tuesday nights, either in person or remotely.

------------------------
### Work board
#### In progress now
- **Discipline data**: Adding heatmap/scatterplot for day/time patterns
- **Homework help**: Importing data about students joining homework help sessions
- **Website**: Release new website

#### Next up
- **Searching notes**: Prototyping this for all users across districts (eg, SHS counselors, MTSS in Somerville K8, BBST in New Bedford)
- **Warnings about sensitive topics in notes**: Prompts about things like "51a" or "depression"

#### Maybe next month
- **K8 reading**: Helping classroom teachers, reading specialists and coaches visualize reading progress on F&P and DIBELS
- **Services and supports**: Possibly looking into tracking and showing all the services that counselors and K8 SST/MTSS teams are connecting students with, and making that visible in Insights.
- **HS grades**: Grade distributions?
- **Equity**: Potentially looking at class list assignments, grade 2/3 reading, PowerBI for achievement vs. SGP broken down by student characteristics.

------------------------
### Changelog

Friday 11/2 updates:
- **Profile page homeroom link bug**: Remove links to SHS homerooms that aren't meaningful and led to error pages [#2214](https://github.com/studentinsights/studentinsights/pull/2214)
- **Discipline analysis**: Add dropdown to filter by Grade, house and Counselor [#1661](https://github.com/studentinsights/studentinsights/pull/1661)
- **Discipline**: Starting HS conversation next week about major/minor incidents
- **Community Schools**: Add community schools-based feed filter [#2221](https://github.com/studentinsights/studentinsights/pull/2221)
- **Bedford MCAS**: Import MCAS data for Bedford, but not 3rd grade math yet [#2223](https://github.com/studentinsights/studentinsights/pull/2223)
- **Fix MCAS bugs**: SGP for Next Gen tests, E filter on overview [#2228](https://github.com/studentinsights/studentinsights/pull/2228) [#2226](https://github.com/studentinsights/studentinsights/pull/2226)
- **Improve SPED and ELL profile for Bedford**: Removing some data that isn't meaningful [#2217](https://github.com/studentinsights/studentinsights/pull/2217)
- **New Bedford AssessmentImporter disabled**: While fixing upstream data problems in SIS
- **Alerting**: Notify developers on import changes outside expected norms [#2213](https://github.com/studentinsights/studentinsights/pull/2213)

Friday 10/26 updates:
- **Training with Community Schools after school coordinators**: Training on writing notes and best light to grant access
- **Speed up Roster page**: Rework precomputing, but some requests are still falling through
- **Somerville student photos**: One-time import, added photos for 104 active students
- **Improved display ELL data**: ELL designations and levels, program enrollment, rubric, transition date for former English learners
- **Improved student meeting importer**: For name changes between Google/SIS/LDAP and limiting to district email addresses
- **Fix issues with export and import for students in Bedford**: Worked around export bug and improved underlying issue

Friday 10/19 updates:
- **Sports teams** show up in Insights with emoji ⚽!
- **NGE/10GE/NEST Student Meetings** show up as notes in Insights as well
- **Levels for SHS Systems and Supports** is released to all SHS teachers, link at the top of any page
- **Snapshots of grade and levels** are now taken behind the scenes so we can look at changes over time in a month or two
- **ELL-based home page feed** for HS ELL admin

<a href="https://github.com/studentinsights/studentinsights/issues?q=is%3Apr+is%3Aclosed" style="background: #4A90E2; color: white; padding: 10px; display: inline-block">See all changes on github.com</a>
