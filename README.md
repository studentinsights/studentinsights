# Student Insights

[![Build Status](https://travis-ci.org/codeforamerica/somerville-teacher-tool.svg?branch=master)](https://travis-ci.org/codeforamerica/somerville-teacher-tool) [![Code Climate](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool/badges/gpa.svg)](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool)

Student Insights enables educators to see at-risk students and match them to the help they need.

#### User stories
* As an admin, I want to see which students are at risk and whether they are receiving necessary interventions.

* As a teacher, I want to see which students are at risk and target interventions to these students.

* As a teacher, I want to see how my students are doing both academically and behaviorally over time.

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

### Heroku

We deployed this app on Heroku once and you can, too. Be sure to set config variables for DEVISE_SECRET_KEY and SECRET_KEY_BASE before deploying.

### Your own server

Our plan is to deploy Student Insights on Somerville Public Schools' machines and serve over their intranet. Capistrano does our deployment. Set `SERVER_NAME` in `config/initializers/capistrano.rb` and run:

```
cap production deploy
```

## Future?
This app could grow in several different ways.

* __Unique URLs__: Can be generated to be viewed online at a later time by users with access.
* __Printable PDFs__: Can be exported of any view for teachers to print out.
* __Sub-views__:  Create sub-views for parents and students.

## Design
For a history of all design iterations look here:
https://www.dropbox.com/sh/r71hh9azun8v6as/AABtBghkPI4XUJBZjNpMmRdba?dl=0

## Who made this?
Alex, Amir, and Mari from Code for America's [Somerville Fellowship Team](http://www.codeforamerica.org/governments/somerville/) in collaboration with the City of Somerville and Somerville Public Schools --- and great support from the Code for SF and Code for Boston brigade volunteers!
