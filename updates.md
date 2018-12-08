{% include navbar.html %}

# What's next?
*Last updated on 12/7/18*

Student Insights is [open source](https://github.com/studentinsights/studentinsights), which means that all code and all changes are published publicly.  We also aim to build in the open, and so much of our discussion about what to build and why is public as well.  We also believe in [free software](https://www.gnu.org/philosophy/free-sw.en.html), and the idea that school communities should have the freedom to run, copy, change and improve their software.  If this is new to you, welcome!

We also release a short summary of changes each week as a [changelog](#changelog), aimed at the educators we collaborate with.  For longer term planning, we use a [work board](#work-board) to communicate about what we're working on right now, what's coming up soon, and potential projects a few months out.

If you'd like to collaborate with us, the best way to do this is to <a href="{{site.links.email}}">reach out over email</a> and we can help you get started.  Designers and developers can also join the local Code for Boston brigade on Tuesday nights, either in person or remotely.

<style>
.Board {
  display: flex;
}
@media (max-width: 600px) {
  .Board {
    flex-direction: column;
  }
}
@media (min-width: 600px) {
  .Board {
    flex-direction: row;
  }
}


.Board-category {
  flex: 1;
}

.Board-title {
  font-size: 20px;
  margin-bottom: 10px;
}
@media (max-width: 600px) {
  .Board-title {
    margin-top: 20px;
  }
}


.Card {
  display: inline-block;
  background: #eee;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
@media (max-width: 600px) {
  .Card {
    width: 100%;
    min-height: 120px;
  }
}
@media (min-width: 600px) {
  .Card {
    width: 300px;
    height: 120px;
    overflow-y: scroll;
  }
}


</style>
------------------------
### Work board
<div class="Board">
  <div class="Board-category">
    <div class="Board-title">In progress now</div>
    <div class="Card"><b>Searching notes</b>: For finding past conversations, and for individual and group reflection</div>
    <div class="Card"><b>504 plans</b>: Export and import 504 plans and accommodations for Somerville</div>
    <div class="Card"><b>K5 reading</b>: Initial design collaborations on: looking up data points, groupings and interventions, MTSS, finding gaps</div>
    <div class="Card"><b>Discipline data</b>: Adding heatmap/scatterplot for day/time patterns</div>
    <div class="Card"><b>Redesigned logo</b>: For website and product itself</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Next up</div>
    <div class="Card"><b>Mark note as restricted</b>: Allow educators to catch each other if anything slips through</div>
    <div class="Card"><b>Warnings about sensitive topics in notes</b>: Prompt about educator-defined like for things like "51a" or "depression"</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Maybe next quarter</div>
    <div class="Card"><b>Student voice as support</b>: Collaborating to find ways to support more student voice as a support intervention (eg, MTSS in K8, redirect in HS).</div>
    <div class="Card"><b>Equity</b>: Potentially looking at class list assignments, grade 2/3 reading, PowerBI for achievement vs. SGP broken down by student characteristics.</div>
    <div class="Card"><b>Services and supports</b>: Possibly looking into tracking and showing the services that counselors and K8 SST/MTSS teams are connecting students with, and making that visible in Insights.</div>
    <div class="Card"><b>HS grades</b>: Grades and levels over time? Semi-automated import of quarterly grades or IPR codes?  Grade distributions?</div>
  </div>
</div>

------------------------
### Changelog

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

<a class="btn" href="https://github.com/studentinsights/studentinsights/issues?q=is%3Apr+is%3Aclosed">See all changes on github.com</a>

{% include footer.html %}