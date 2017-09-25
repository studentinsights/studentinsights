# Student Insights

[![Build Status](https://travis-ci.org/studentinsights/studentinsights.svg?branch=master)](https://travis-ci.org/studentinsights/studentinsights)
[![Code Climate](https://codeclimate.com/github/studentinsights/studentinsights/badges/gpa.svg)](https://codeclimate.com/github/studentinsights/studentinsights)

Student Insights gives educators an overview of student progress at their school, classroom-level rosters and individual student profiles.  It also allows them to capture interventions and notes during weekly or bi-weekly student support meetings focused on the most at-risk students.

Check out the [demo site](https://somerville-teacher-tool-demo.herokuapp.com/):
  - username: `demo@example.com`
  - password: `demo-password`

Our presentation at [Code for Boston demo night](docs/readme_images/Student%20Insights%20-%20Demo%20Night%20slides.pdf) in May 2016 also has a good product overview.

<!-- UPDATE WITH DOCTOC: $ doctoc README.md -->

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
# Table of Contents

- [User personas: Who we're serving](#user-personas-who-were-serving)
- [Product overview: How we're helping](#product-overview-how-were-helping)
  - [School overview](#school-overview)
  - [Classroom rosters](#classroom-rosters)
  - [Student profiles](#student-profiles)
    - [Capturing meeting notes and interventions](#capturing-meeting-notes-and-interventions)
- [Contributing](#contributing)
- [How it works](#how-it-works)
  - [Admin dashboard](#admin-dashboard)
- [Development Environment](#development-environment)
  - [1. Install dependencies](#1-install-dependencies)
  - [2. Create database tables and seed them with demo data](#2-create-database-tables-and-seed-them-with-demo-data)
  - [3. Start Rails](#3-start-rails)
  - [4. Run the tests](#4-run-the-tests)
  - [5. Write code!](#5-write-code)
  - [6. Use the product locally!](#6-use-product)
- [Browser/OS Targeting](#browseros-targeting)
- [Deployment](#deployment)
  - [Deploying new code to Insights](#deploying-new-code-to-insights)
  - [Setting up Insights for a new district](#setting-up-insights-for-a-new-district)
    - [New district script](#new-district-script)
    - [Importing real data](#importing-real-data)
    - [LDAP](#ldap)
    - [Heroku notes](#heroku-notes)
- [Other Tools](#other-tools)
  - [Mixpanel](#mixpanel)
- [More information](#more-information)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# User personas: Who we're serving
There are three main user personas we're serving. Principals, Interventionists and Classroom Teachers. Right now we're focused primarily on serving principals, and the rough progression will likely be to Interventionists next. Early adopter Classroom Teachers are great, but focused on scaling adoption across all classroom teachers isn't a priority yet.

Principals are responsible for a school, from ensuring all students are progressing academically to making hiring and staffing decisions for teachers.

Interventionists are typically folks who provide some kind of specialized service to students, like counseling, behavioral services or specialized reading instruction. They have caseloads of 20-70 students and are often involved in interdisciplinary teams focused on supporting students who are most at-risk.

Classroom Teachers are responsible for teaching all subjects in an elementary level, and at the middle school level typically teach two subjects, with a few periods of each subject.

# Product overview: How we're helping
## School overview
Principals and intervention specialists can get an overview of all students at school, updated automatically as new data comes in.  This includes demographic information (left), academic progress indicators (center), and educational interventions (right).

![Overview](docs/readme_images/overview-summary.png)

Educators answer specific questions like "how are 3rd grade students doing on reading assessments?" and "are students on free lunch programs equitably distributed between 5th grade classrooms?"  This is useful for understanding progress for groups of students, and also for identifying particular students in need of targeted interventions.

![Filtering](docs/readme_images/overview-filtered.png)

Data can be exported as a CSV for more sophisticated analysis.

## Classroom rosters
Classroom teachers can see rosters of all students in their classroom, calling out high-need students and letting them jump into the student's case history and record of previous assessments and interventions.

![Rosters](docs/readme_images/roster.png)

## Student profiles
Individual student profiles show how students are progressing on core academic skills, as measured summatively by MCAS or on more frequent formative measures like STAR assessments.

![Profile](docs/readme_images/profile-summary-screenshot.png)

Student profiles also contain the full case history of demographic information, attendance and behavioral support.

![Profile](docs/readme_images/profile-full-case-history-screenshot.png)

We're working on some big improvements to the student profile page right now, check out [#5](https://github.com/studentinsights/studentinsights/issues/5) for more background.


### Capturing meeting notes and interventions
It's one thing to have data, but acting on it to improve student outcomes is what really matters.  Schools with regular student support meetings for at-risk students can track interventions like additional tutoring hours, attendance contracts or social skills groups.  This is a building block to close the loop and monitor how effectively these interventions are serving students.

![Interventions](docs/readme_images/recording-services-screenshot.png)

It also allows capturing meeting notes as part of the student's record, which is particularly important on interdisciplinary teams.

# Contributing
We'd love your help! Take a look at **[CONTRIBUTING.md](CONTRIBUTING.md)** for more information on ways educators, developers and others can get involved and contribute directly to the project.  You can also learn how to join our online chat channel and submit pull requests and join us in person at our weekly hack night with Code for America, in Kendall Square, Cambridge.

# How it works
The project is a Rails app with a Postgres database.  There are background tasks that replicate data from the Aspen SIS system and STAR assessment system into the Postgres database.  This enables rapid iteration and experimentation on new product features with minimal risk to these existing production systems.  The Postgres database is the system of record for unique data captured by the Student Insights product (eg., notes from clinical meetings and information about targeted interventions that students are receiving).  Authentication is handled by the district's LDAP service.

![how it works](docs/readme_images/how_it_works.png)

## Admin dashboard

This project includes an admin dashboard built with [thoughtbot/administrate](https://github.com/thoughtbot/administrate).

The admin dashboard has one function: Allow admins (principals, assistant principals, district admins) to set user roles and permissions for other staff, in particular staff who are not classroom-based teachers.

The admin dashboard is available at `/admin` for educators whose `admin` attribute is `true`.

# Development Environment

This is a Ruby on Rails app that uses a PostgreSQL database, and relies on React for much of the UI code.

## 1. Install dependencies

Choose your favorite local development approach:

* [Local development with Docker](docs/technical/local_development_with_docker.md)
* [Local installation on OSX or Linux](docs/technical/local_installation_notes.md)

## 2. Create database tables and seed them with demo data

```
bundle exec rake db:create db:migrate db:seed
```

This will create demo students with fake student information. The demo educator username is `demo@example.com` and the demo password is `demo-password`.

## 3. Start Rails
Once you've created the data, start a local server by running `rails s` from the root of your project. When the local server is up and running, visit http://localhost:3000/ and log in with your demo login information. You should see the roster view for your data.

## 4. Run the tests
This app uses [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs). Run the test suite:

```
rspec
```

It uses [Jasmine](http://jasmine.github.io/) for JavaScript tests, run through the [Teaspoon](https://github.com/modeset/teaspoon) gem.  You can run them in the browser at `http://localhost:3000/teaspoon/default`.

You can also run them from the command line:

```
teaspoon
```

[eslint](http://eslint.org/) is setup, but not in the build yet since it would take some cleanup.  See https://github.com/studentinsights/studentinsights/pull/637 for more information, and try this out with either:

```
docker-compose build tools
docker-compose run tools
```

or

```
cd scripts/tools
npm install
npm run lint-quiet
```

## 5. Write code!
This project is a Rails app and has a typical Rails project structure.  If you'd like to get up to speed on Rails, we recommend checking out their [great documentation](http://guides.rubyonrails.org/).

It also uses React for much the user interface code.  If you'd like to get up to speed on React, we recommend their great documentation, and the [Tutorial](https://facebook.github.io/react/docs/tutorial.html) and [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html) pages in particular.

There are also a few places where we use [Flux](https://facebook.github.io/flux/docs/overview.html) patterns.

If you use **Sublime Text Editor**, we include the `studentinsights.sublime-project` file to standardize minor things like tabs vs. spaces, indentation, and generally make it easier to work with our folder structure. Go to `Project --> Open Project` and select that file to load it. Sublime remembers which project you were last in, so you only need to do this once. ([Here](http://www.joshuawinn.com/understanding-projects-in-sublime-text-saving-switching-etc/)'s some background info on how projects work in Sublime).

## 6. Use the product locally
Users use IE11, so if you're trying to manually test locally or the production site, you should too!  If you have a Mac or Linux box, you can use free VMs designed for just this purpose and run them on VirtualBox: https://developer.microsoft.com/en-us/microsoft-edge/tools/vms/.

Useful tidbits:
- These virtual machines expire after 90 days, so take a snapshot right away and rollback when it expires
- Enable "Shared Clipboard" in the Devices menu
- Disable the "Host Capture" key
- Point to http://10.0.2.2:3000/ to access the host instance of Student Insights

# Browser/OS Targeting

Category | Target | Comment
--- | --- | ---
Browser | IE 11 | "Should be all IE 11 by now." <br>    – John Breslin, Technology Department, Somerville Public Schools
OS | Windows 7 and 8.1 | "Maybe some Win10 next year." <br>    – John Breslin, Technology Department, Somerville Public Schools


# Deployment

## Deploying new code to Insights

See our guide:

[Merging and deploying new code to Heroku](docs/technical/merging_and_deploying_to_heroku.md).

## Setting up Insights for a new district

### New district script

Insights uses a separate-instance strategy for new districts (one database and one Heroku app per district).

Set up a new district:

```
$ scripts/deploy/new_district.sh "My New District Name"
```

This sets up a new Heroku app instance with the Student Insights code and copies over some basic configuration around the district name. It gives you the option to fill the instance with fake data if you like. It doesn't yet include tooling for connecting with a Student Information System or other district-level data sources.

### Importing real data

If you're working with a real school district, you'll need flat files of the data you want to import.

Run an import task:

```
thor import:start
```

So far, Student Insights can import CSV and JSON and can fetch data from AWS and SFTP. To import a new flat file type, write a new data transformer: `app/importers/data_transformers`. To import from a new storage location, write a new client: `app/importers/clients`.

### LDAP

The project is configured to use LDAP as its authentication strategy in production. To use database authentication (in a production demo site, for example) set the `SHOULD_USE_LDAP` environment variable. Authentication strategies are defined in `educator.rb`.

### Heroku notes

[Quotaguard Static](https://www.quotaguard.com/static-ip), a Heroku add-on, provides the static IP addresses needed to connect with Somerville's LDAP server behind a firewall. This requires additional configuration to prevent Quotaguard Static from interfering with the connection between application and database.

One way to accomplish this is to set a `QUOTAGUARDSTATIC_MASK` environment variable that routes only outbound traffic to certain IP subnets using the static IPs. [Read Quotaguard Static's documentation for more information.](https://devcenter.heroku.com/articles/quotaguardstatic#socks-proxy-setup)

# Ops
Here are some notes on maintaining, troubleshooting and performance.

## Response latency
Look in the Heroku metrics panel.  If you need to understand further, use Scout.

## Postgres
You can use [heroku-pg-extras](https://github.com/heroku/heroku-pg-extras) to get helpful diagnostic information about slow queries, index usage, and table scans.

# Other Tools

## Mixpanel

We use [Mixpanel](https://mixpanel.com) to track user interactions on the client side. It gives us nice graphs so we can see who's using the app and how.

# More information

- [Drop into the #somerville-schools chat](https://cfb-public.slack.com/messages/somerville-schools/) on [Code for Boston Slack](http://public.codeforboston.org/)
- Connect with [Alex](https://twitter.com/alexsoble) or [Kevin](https://twitter.com/krob) on Twitter or with @eli-rose on Code for Boston Slack
- More docs in the `docs` folder!
