# Homeroom: A Student Roster Generator for Somerville

## Who 
Amir, Mari, and Alex from Code for America's [Somerville Fellowship Team](http://www.codeforamerica.org/governments/somerville/) kicked up this app during Build Week 2015 as a warm-up getting-to-know-you exercise. The initial product idea and subsequent feedback came from Stephanie Hirsch, Director of SomerStat and other exciting projects in the Mayor's Office of Somerville. 

## What
The app creates rosters of students that can be grouped in different ways, including by homeroom, by section, by sub-group (e.g. low-income students), and by risk. The student risks are assigned according to a formula using MCAS and other assessments. Teachers, building level administrators, and district administrators could use this roster to see patterns in their classroom and craft specific interventions to support their students. 

This app takes de-identified sample data from an Excel file as input. (At present from Excel, may become more automated in the future.) It uses that data to create a roster view that can sort students into groups based on:

* Home room
* Risk factors
* Demographics

### A user story
As an admin I want to generate reports based on homerooms so that I can see the students at risk in that selected room.

## Status
This app is in the "experimental / plaything / demo" stage as of late January 2015. It draws from a single set of de-identified sample data from Excel to generate homerooms and risk levels, so it can't do anything useful in the wild right. If this demo seems promising to stakeholders and early iterations prove useful it could grow up over the course of the fellowship year.

## How To
This is a Ruby on Rails app and uses a PostgreSQL database. See Code for America's "HowTo" on Rails for more information on deploying and maintaining apps using Rails: https://github.com/codeforamerica/howto/blob/master/Rails.md

## Future? 
This app could grow in several different ways.
* __Sub-views__:  Create sub-views with more limited and focused access to data. These sub-views could be made available to others within the school community, including parents and students. 
* __After-school__:  Incorporate data about after-school programs. 
* __Interventions__:  Allow teachers to add interventions to the system and track how they impact student progress. (This is a top priority.)
* __Unique URLs__: Can be generated to be viewed online at a later time by users with access.
* __Printable PDFs__: Can be exported of any view for teachers to print out and use at data meetings. 

## Tests
This app uses the [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs) testing library. To run the test suite:

```
rspec
```