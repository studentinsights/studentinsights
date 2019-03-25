Friday 3/22 updates:
- **Notes**: Remove older props no longer used for restricted note [#2431](https://github.com/studentinsights/studentinsights/pull/#2431)
- **Authorization**: Update authorizer to expose reason why educator is authorized [#2430](https://github.com/studentinsights/studentinsights/pull/#2430)
- **Home page feed**: Allow flag for showing photos [#2432](https://github.com/studentinsights/studentinsights/pull/#2432)

Friday 3/15 updates:
- **SHS Levels**: Add filter for counselors [#2426](https://github.com/studentinsights/studentinsights/pull/#2426)
- **Maintenance**: Add favicon path [#2427](https://github.com/studentinsights/studentinsights/pull/#2427)
- **Security**: Add zxcvbn for checking password entropy [357b40](https://github.com/studentinsights/studentinsights/commit/357b40)
- **Security**: Warn on suspicious login, after long period of inactivity [24122f](https://github.com/studentinsights/studentinsights/commit/24122f)
- **Security**: Update Rails to 5.2.2.1 to patch vulnerabilities
- **Security**: Update Brakeman [#2428](https://github.com/studentinsights/studentinsights/pull/#2428)
- **Security**: Security and Privacy Assessment (quarterly, not public)
- **Security**: Update Devise to 4.6.1 to patch vulnerability [5e0a29](https://github.com/studentinsights/studentinsights/commit/5e0a29)

Friday 3/8 updates:
- **Sign in**: Revise session expired copy [#2423](https://github.com/studentinsights/studentinsights/pull/#2423)
- **Sign in**: Feedback while signing in, using rails-ujs [#2425](https://github.com/studentinsights/studentinsights/pull/#2425)
- **Profile PDF**: Update to allow restricted notes, revise styling and layout [#2424](https://github.com/studentinsights/studentinsights/pull/#2424)
- **Security**: Add audits for vulnerabilities in Ruby dependencies [#2422](https://github.com/studentinsights/studentinsights/pull/#2422)
- **Security**: Upgrade for RubyGems vulnerabilities link

Friday 3/1 updates:
- **Sign in**: Release new sign in page [#2405](https://github.com/studentinsights/studentinsights/pull/#2405)
- **Collaboration**: SHS Counseling Team workshop [slides](https://drive.google.com/file/d/1wIHDRi1Jbk7kwgMXuAgj416hxHZAQdqR/view)

Friday 2/22 updates:
- (school vacation week)

Friday 2/15 updates:
- **Class lists**: Revise analysis to consider separate programs
- **Student voice**: Share summary on status for surveys
- **Profile**: Rework state for text while taking notes to remove lag [#2415](https://github.com/studentinsights/studentinsights/pull/#2415)
- **Profile**: Remove second 'ago' suffix from testing tab to prevent overflow [#2416](https://github.com/studentinsights/studentinsights/pull/#2416)
- **Session renewal**: Update debug logging [#2417](https://github.com/studentinsights/studentinsights/pull/#2417)
- **Maintenance**: Upgrade to jQuery 3.3 [#2411](https://github.com/studentinsights/studentinsights/pull/#2411)
- **Maintenance**: Update font files [#2419](https://github.com/studentinsights/studentinsights/pull/#2419)
- **Maintenance**: Guard sessionStorage usage more [#2418](https://github.com/studentinsights/studentinsights/pull/#2418)
- **Maintenance**: Upgrade databases to Postgres 11.2

Friday 2/8 updates:
- **Student voice**: Decouple profile insights and grades reflection switches [#2392](https://github.com/studentinsights/studentinsights/pull/2392)
- **Student voice**: Fix timezone parsing in importing form timestamps [#2393](https://github.com/studentinsights/studentinsights/pull/2393)
- **Student voice**: Show start-of-year survey in notes feed [#2396](https://github.com/studentinsights/studentinsights/pull/2396)
- **Student voice**: Update differences between what shows in profile notes / profile insights [#2400](https://github.com/studentinsights/studentinsights/pull/2400)
- **Whole-child**: Prototype embedding video clips from student of the quarter awards
- **Maintenance**: Upgrade to React 16.7, add RollbarErrorBoundary [#2397](https://github.com/studentinsights/studentinsights/pull/2397)
- **Sign in**: Preview that sign-in page will change soon [#2403](https://github.com/studentinsights/studentinsights/pull/2403)
- **K8 update email**: Discipline patterns tool and finding 504 plan accommodations
- **Design**: Update favicon! [#2404](https://github.com/studentinsights/studentinsights/pull/2404)

Friday 2/1 updates:
- **Student voice**: Import mid-year survey, show on profile notes [#2379](https://github.com/studentinsights/studentinsights/pull/2379)
- **Student voice**: Add Q2 self-reflection to profile notes [#2381](https://github.com/studentinsights/studentinsights/pull/2381)
- **Student voice**: Add profile insights from winter student voice surveys [#2383](https://github.com/studentinsights/studentinsights/pull/2383)
- **Student voice**: Highlight new student voice surveys in home feed [#2382](https://github.com/studentinsights/studentinsights/pull/2382)
- **Student voice**: Add self-reflection on Q2 next to grades [#2384](https://github.com/studentinsights/studentinsights/pull/2384)
- **Student voice**: Fix timezone bug on imports; release profile insights with feature switch for Q2 self-reflection [#2387](https://github.com/studentinsights/studentinsights/pull/2387)
- **Access importer**: guard against nil values upstream [#2380](https://github.com/studentinsights/studentinsights/pull/2380)
- **Website**: Cap maximum size of photos [#2385](https://github.com/studentinsights/studentinsights/pull/2385)
- **Website**: Add privacy policy [#2386](https://github.com/studentinsights/studentinsights/pull/2386)
- **Profile**: Fix bug with rendering IepDialog in Bedford [#2376](https://github.com/studentinsights/studentinsights/pull/2376)
- **Profile**: Restrict student discipline scatter plot to school year [#2373](https://github.com/studentinsights/studentinsights/pull/2373)
- **Session renewal**: Rework to probe server to warn about session expiration instead of using heuristic [#2377](https://github.com/studentinsights/studentinsights/pull/2377)
- **Session renewal**: Fix bug from IE11 fetch polyfill [#2389](https://github.com/studentinsights/studentinsights/pull/2389)
- **Discipline**: Removing n+1 queries in discipline dashboard [#2375](https://github.com/studentinsights/studentinsights/pull/2375)
- **Discipline**: Dashboard release [#2374](https://github.com/studentinsights/studentinsights/pull/2374)


Friday 1/25 updates:
- **Reading**: Update grouping page to include computations, cut points, and click to see more [#2363](https://github.com/studentinsights/studentinsights/pull/2363)
- **Reading**: Reading**: Iterations on grouping UI styling and feel [#2367](https://github.com/studentinsights/studentinsights/pull/2367)
- **Login**: Revise timing for SessionRenewal to actually enable renewing [#2366](https://github.com/studentinsights/studentinsights/pull/2366)
- **Reading**: Reading**: store grouping state locally, snapshot grouping state and post to server [#2368](https://github.com/studentinsights/studentinsights/pull/2368)
- **Discipline**:  Add discipline code back to filter [#2365](https://github.com/studentinsights/studentinsights/pull/2365)
- **Discipline**: Hide scatterplot for large schools [#2362](https://github.com/studentinsights/studentinsights/pull/2362)
- **Restricted notes**: Clarify that admin can also mark notes restricted [#2371](https://github.com/studentinsights/studentinsights/pull/2371)

Friday 1/18 updates:
- **Student photos**: Batch update for Somerville
- **Reading**: Allow teams to enter benchmark reading data [#2352](https://github.com/studentinsights/studentinsights/pull/2352)
- **Reading**: Minimal prototype for grouping workflow, no computation, interaction or persistence [#2360](https://github.com/studentinsights/studentinsights/pull/2360)
- **MTSS**: Add minimal semi-automated importer for MTSS referral form [#2361](https://github.com/studentinsights/studentinsights/pull/2361)
- **Discipline**: Profile Heatmap Additions [#2353](https://github.com/studentinsights/studentinsights/pull/2353)

Friday 1/11 updates:
- **Security**: Enable multi-factor authentication for Bedford project leads
- **504 plans**: Export and import 504 plans and accommodations for Somerville [#2287](https://github.com/studentinsights/studentinsights/pull/2287) [#2294](https://github.com/studentinsights/studentinsights/pull/2294) [#2302](https://github.com/studentinsights/studentinsights/pull/2302) [#2315](https://github.com/studentinsights/studentinsights/pull/2315) [#2322](https://github.com/studentinsights/studentinsights/pull/2322) [#2331](https://github.com/studentinsights/studentinsights/pull/2331) [#2347](https://github.com/studentinsights/studentinsights/pull/2347)
- **Mark note as restricted**: Allow educators to catch sensitive topics searching notes [#2304](https://github.com/studentinsights/studentinsights/pull/2304)
- **Website images**: Resize to reduce loading time

Friday 1/4 updates:
- **Website**: Tap to show full screen images on Our work page
- **Class lists**: Export data for analyzing drift and exploring questions around equity and diversity [#2342](https://github.com/studentinsights/studentinsights/pull/2342)
- **Notes**: Export anonymized sample of notes for internal analysis and training [#2343](https://github.com/studentinsights/studentinsights/pull/2343)
- **HS sports teams**: Update to reflect winter sports teams [#2345](https://github.com/studentinsights/studentinsights/pull/2345) [#2346](https://github.com/studentinsights/studentinsights/pull/2346)
- **Discipline**: Add day/time scatterplot to student profile for seeing trends [#2349](https://github.com/studentinsights/studentinsights/pull/2349)

Friday 12/21 updates:
- **Profile**: Update educator contacts to respect PerDistrict setting for counselor field [#2334](https://github.com/studentinsights/studentinsights/pull/2334)
- **Profile**: Fix bug with incorrectly showing IEP link in Bedford [#2332](https://github.com/studentinsights/studentinsights/pull/2332)
- **Profile**: Add teacher name for homeroom [#2338](https://github.com/studentinsights/studentinsights/pull/2338)
- **504 plans**: Released to SHS counseling team
- **Redesigned logo**: For website and product itself [#2292](https://github.com/studentinsights/studentinsights/pull/2292) [#2293](https://github.com/studentinsights/studentinsights/pull/2293) [#2337](https://github.com/studentinsights/studentinsights/pull/2337) [#2339](https://github.com/studentinsights/studentinsights/pull/2339)
- **Website**: Tap to show full screen images [9340cd](https://github.com/studentinsights/studentinsights/commit/9340cd)
- **Photos**: Enable student photos for Bedford [#2340](https://github.com/studentinsights/studentinsights/pull/2340)
- **Reading**: Reviewing prototype visualizations of DIBELS ORF growth in Somerville

Friday 12/14 updates:
- **Security**: Add another layer of guards protecting against inadvertent permission bugs in S3
- **Security**: Add private methods for provisioning multifactor authentication manually [#2326](https://github.com/studentinsights/studentinsights/pull/2326)
- **Profile**: Fix sort bug on grades table by educator, from an older migration [#2319](https://github.com/studentinsights/studentinsights/pull/2319)
- **Discipline**: Adding scatterplot for day/time patterns [#2242](https://github.com/studentinsights/studentinsights/pull/2242)
- **My notes**: Revise layout and add word cloud, shipped dark [#2325](https://github.com/studentinsights/studentinsights/pull/2325)
- **Notes**: Adjust note types for Bedford [#2327](https://github.com/studentinsights/studentinsights/pull/2327)

Friday 12/7 updates:
- **Security**: Update instructions to crawlers [#2281](https://github.com/studentinsights/studentinsights/pull/2281)
- **Absences**: Add "recent" to title of school absence, tardies, discipline pages [#2282](https://github.com/studentinsights/studentinsights/pull/2282)
- **Levels**: Fix sort bug for counselor note in table [#2285](https://github.com/studentinsights/studentinsights/pull/2285)
- **Security**: Upgrade Rails [80fade](https://github.com/studentinsights/studentinsights/commit/80fadea386c82a26ccaf1fcb9baccaf8ebdc7d61)
- **Reading**: Add minimal F&P and Dibels data (Somerville) [#2290](https://github.com/studentinsights/studentinsights/pull/2290)
- **Redesigned logo**: Added to public website [#2292](https://github.com/studentinsights/studentinsights/pull/2292) [#2293](https://github.com/studentinsights/studentinsights/pull/2293)
- **Accessibility**: Add more alt tags for images on home and our work [04d363](https://github.com/studentinsights/studentinsights/commit/80fadea386c82a26ccaf1fcb9baccaf8ebdc7d61)
- **504 plans**: Initial export and import data quality checks in Somerville [#2287](https://github.com/studentinsights/studentinsights/pull/2287) [#2294](https://github.com/studentinsights/studentinsights/pull/2294)

Friday 11/30 updates:
- **Security**: Upgrade to Ruby 2.5.3 [#2266](https://github.com/studentinsights/studentinsights/pull/2266)
- **Security**: Avoid logging filenames when downloading IEPs or PDFs [#2268](https://github.com/studentinsights/studentinsights/pull/2268)
- **Security**: Add another layer of tests to verify that all pages require sign on [#2269](https://github.com/studentinsights/studentinsights/pull/2269)
- **Security**: Enable multifactor authentication for all developer accounts (eg, Heroku, AWS, Google, NameCheap, Mailgun)
- **Security**: Enforce 100% test coverage on core authorization files [#2273](https://github.com/studentinsights/studentinsights/pull/2273)
- **Security**: Remove all logging for request parameters (part of [#2274](https://github.com/studentinsights/studentinsights/pull/2274))
- **Security**: Scrub all logging to error monitoring services (part of [#2274](https://github.com/studentinsights/studentinsights/pull/2274))
- **Security**: Update quarterly security assessment, reviewing OWASP ASVS and OWASP Proactive Controls
- **Security**: Enable multifactor authorization flows using Authenticator app and SMS [#2274](https://github.com/studentinsights/studentinsights/pull/2274)
- **Security**: Rollout multifactor authentication for all dev accounts and Somerville project lead
- **Security**: Review security patches and updates for all SFTP instances
- **Security**: Add ufw and fail2ban for all SFTP instances
- **Security**: Limit SFTP read permissions further to minimal user set
- **Design**: Add favicon to the site [#2272](https://github.com/studentinsights/studentinsights/pull/2272)
- **Accessibility**: Update home page to have image captions and tags for screen readers [622ce4..ad5b66](https://github.com/studentinsights/studentinsights/compare/622ce445..ad5b6627)
- **Website**: Publish at www, add @studentinsights.org email addresses

Friday 11/23 updates:
- **Security**: Add additional firewall layer for blocking and throttling login attacks [#2244](https://github.com/studentinsights/studentinsights/pull/2244)
- **Security**: Update login to have consistent response times (fd2283..f2d5ff)
- **Bug fix**: On district page, filter school codes with no active students [#2246](https://github.com/studentinsights/studentinsights/pull/2246)
- **Update note types for Bedford**: Update to support structures in Bedford [#2250](https://github.com/studentinsights/studentinsights/pull/2250)
- **Security**: Remove Google Font loader [#2263](https://github.com/studentinsights/studentinsights/pull/2263)
- **Security**: Remove Mixpanel [#2253](https://github.com/studentinsights/studentinsights/pull/2253)
- **Search notes**: Improve prototype to allow fulltext querying and searching by school and [#2252](https://github.com/studentinsights/studentinsights/pull/2252)

Friday 11/16 updates:
- **Website**: Released new website to first internal reviewers
- **Mini-internship**: Started working weekly with two SHS students
- **Search notes**: First prototype released internally

Friday 11/9 updates:
- **Bedford MCAS import**: Fix export and import of 3rd grade Math MCAS data, fix export bug with SGP [#2239](https://github.com/studentinsights/studentinsights/pull/2239)
- **Bedford MCAS profile**: Update profile to highlight MCAS since there is no STAR data [#2234](https://github.com/studentinsights/studentinsights/pull/2234)
- **Bedford**: Access for K-5 director of student achievement
- **Counselor meeting note type**: Add counselor meeting note type, for sorting, for Levels page and later for searching [#2233](https://github.com/studentinsights/studentinsights/pull/2233)
- **Levels**: Improve matching in ELA/SS for ELL courses [#2235](https://github.com/studentinsights/studentinsights/pull/2235)
- **SHS Homework help**: Import data and show on profile to start [#2236](https://github.com/studentinsights/studentinsights/pull/2236)
- **Mini-internship setup**: Starting next Thursday!

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
