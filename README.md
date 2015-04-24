# Teacher Tool: A Student Roster Generator for Somerville [![Build Status](https://travis-ci.org/codeforamerica/somerville-teacher-tool.svg?branch=master)][travis]
[travis]: https://travis-ci.org/codeforamerica/somerville-teacher-tool

## What
The app creates an interactive tool for teachers to view:

* rosters of students that can be grouped and sorted in different ways, including by homeroom, by demographic sub-groups (e.g. low-income students), and by risk level
* profiles of students with attendance and behavioral information over time

## Why
Teachers, building-level administrators, and district administrators could use this tool to see patterns in their classroom and target specific interventions to support their students. 

#### User story
As an admin, I want to see which students are at risk and whether they are receiving necessary interventions.

As a teacher, I want to see which students are at risk and target interventions to these students.

As a teacher, I want to see how my students are doing both academically and behaviorally over time.

## Installation
This is a Ruby on Rails app and uses a PostgreSQL database. See Code for America's "HowTo" on Rails for more information on deploying and maintaining apps using Rails: https://github.com/codeforamerica/howto/blob/master/Rails.md

## Tests
This app uses the [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs) testing library. To run the test suite:

```
rspec
```

#### Pre-commit
This app comes with a suggested pre-commit file that you can add to your git hooks. It will run the tests before any commmits, so you can be sure any changes you add are kosher.

Add to your git hooks: 

```
cp pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit 
```

If you have a good reason to skip the test suite and commit straightaway:

```
git commit --no-verify
```

## Status
We kicked up this app during Build Week 2015 as a warm-up getting-to-know-you exercise. The initial product idea and subsequent feedback came from Stephanie Hirsch as well as other exciting projects in the Somerville Public Schools. 

This app is in the "experimental / plaything / demo" stage as of late January 2015. It draws from a single set of de-identified sample data from Excel to generate risk levels by homeroom, so it can't do anything useful in the wild right. If this demo seems promising to stakeholders and early iterations prove useful, it could grow up over the course of the fellowship year.


## Future? 
This app could grow in several different ways.
* __Sub-views__:  Create sub-views with more limited and focused access to data. These sub-views could be made available to others within the school community, including parents and students. 
* __After-school__:  Incorporate data about after-school programs. 
* __Behavioral__:  Incorporate data about behavioral incidents including suspensions and expulsions. 
* __Interventions__:  Allow teachers to add interventions to the system and track how they impact student progress. (This is a top priority.)
* __Unique URLs__: Can be generated to be viewed online at a later time by users with access.
* __Exportable Excel__: Can be exported of any view for teachers to use at data meetings. 
* __Printable PDFs__: Can be exported of any view for teachers to print out. 

## Who made this?
Alex, Amir, and Mari from Code for America's [Somerville Fellowship Team](http://www.codeforamerica.org/governments/somerville/) in collaboration with the City of Somerville and Somerville Public Schools.