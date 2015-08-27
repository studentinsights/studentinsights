# Teacher Tool: A Student Roster Generator for Somerville

[![Build Status](https://travis-ci.org/codeforamerica/somerville-teacher-tool.svg?branch=master)](https://travis-ci.org/codeforamerica/somerville-teacher-tool) [![Code Climate](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool/badges/gpa.svg)](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool)

## What
The app creates an interactive tool for teachers to view:

* rosters of students that can be grouped and sorted in different ways including by homeroom, by demographic sub-groups (e.g. English Language Learner (ELL) status, special education status, etc), by performance, and by risk level
* profiles of students with attendance, behavioral and performance information over time

## Why
Teachers, school-level administrators, and district administrators might use this tool to see patterns in their classroom / schools and target specific interventions to support their students.

#### User story
As an admin, I want to see which students are at risk and whether they are receiving necessary interventions.

As a teacher, I want to see which students are at risk and target interventions to these students.

As a teacher, I want to see how my students are doing both academically and behaviorally over time.

## Installation
This is a Ruby on Rails app and uses a PostgreSQL database. See Code for America's "HowTo" on Rails for more information on deploying and maintaining apps using Rails: https://github.com/codeforamerica/howto/blob/master/Rails.md

### Setting up demo data

To set up demo data after you clone the project, run

```
rake db:seed:demo
```

In addition to creating demo students, homerooms, and assessment results, this will create a demo educator login defined in `db/seeds/demo/demo_educator.seeds.rb`. The demo login has an email address of demo@example.com and the password `demo-password`.

Once you've created the demo data, start a local server by running `rails s` from the root of your project (i.e. in the folder called `somerville-teacher-tool`). When the local server is up and running, visit http://localhost:3000/ or and log in with your demo login information. You should see the roster view for your (demo) data. You can also access the demo site at https://somerville-teacher-tool-demo.herokuapp.com/.

### Importing real data

If you're working with a real school district, you'll need flat files of the data you want to import to Student Insights.

Run an import task:

```
thor import:start
```

Use the `--district` flag to indicate your school district or charter organization. File formats and storage are configured by district in `app/importers/settings/settings.rb`.

So far, Student Insights can import CSV and JSON and can fetch data from AWS and SFTP. To import a new flat file type, you'll want to write a new data transformer: `app/importers/data_transformers`. To import from a new storage location, you'll want to write a new client: `app/importers/clients`.

### Tests
This app uses the [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs) testing library. To run the test suite:

```
rspec
```

#### Pre-commit
This app comes with a suggested pre-commit file that you can add to your git hooks. It will run the tests before any commits, so you can be sure any changes you add are kosher.

Add to your git hooks:

```
cp pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

If you have a good reason to skip the test suite and commit straightaway:

```
git commit --no-verify
```

## Deployment

We are deploying this app on Heroku and you can, too. Be sure to set config variables for DEVISE_SECRET_KEY and SECRET_KEY_BASE in order for your app to deploy properly.

## Status timeline

* __August 2015__:  We iterated on the tool, tweaking and adding features prioritized by teachers, principals, and partners. We collaborated with KIPP NJ to build more robust data integration processes and demonstrated how this tool can be deployed more extensively to other districts (even having different SIS systems).
* __July 2015__:  We piloted the app with teachers and reading coaches during Summer School. We observed the tool being used by teachers to create flexible groupings by math performance. We received a lot of great feedback on issues, functionalities, and features to work on. At Code for Boston, we held a collaborative coding session with a group of ~10 volunteers and built out the export CSV function.
* __June 2015__:  We tested the app with more teachers now and building out the student profile features with the help of Code for SF and Code for Boston brigade volunteers.
* __May 2015__:  We consider the app an alpha product now. Our focus is on building out the student profile feature and improving the roster view while testing working iterations with our teacher partners at Healey.
* __April 2015__:  We had our first call with Healey teachers and principal to get feedback on a working prototype of the app using real data.
* __March 2015__:  We started writing and testing functions to import data from Somerville's Student Information System and student assessment sources.
* __February 2015__:  We met with the fantastic 5th grade teacher team at Healey throughout the month to learn about the challenges they face, see the current tools they use, and sketch paper prototypes together.
* __January 2015__: We kicked up this app during Build Week as a warm-up getting-to-know-you exercise. The initial product idea and subsequent feedback came from Stephanie Hirsch. This app drew from a single set of de-identified sample data from Excel to generate risk levels by homeroom, so it couldn't do anything useful in the wild. We said: "If this demo seems promising to stakeholders and early iterations prove useful, it could grow up over the course of the fellowship year."

## Future?
This app could grow in several different ways.
* __Sub-views__:  Create sub-views with more limited and focused access to data. These sub-views could be made available to others within the school community, including parents and students.
* __After-school__:  Incorporate data about after-school programs.
* __Interventions__:  Allow teachers to add interventions to the system and track how they impact student progress.
* __Unique URLs__: Can be generated to be viewed online at a later time by users with access.
* __Printable PDFs__: Can be exported of any view for teachers to print out.

## Design
For a history of all design iterations look here:
https://www.dropbox.com/sh/r71hh9azun8v6as/AABtBghkPI4XUJBZjNpMmRdba?dl=0

## Who made this?
Alex, Amir, and Mari from Code for America's [Somerville Fellowship Team](http://www.codeforamerica.org/governments/somerville/) in collaboration with the City of Somerville and Somerville Public Schools --- and great support from the Code for SF and Code for Boston brigade volunteers!
