# Student Insights

[![Build Status](https://travis-ci.org/codeforamerica/somerville-teacher-tool.svg?branch=master)](https://travis-ci.org/codeforamerica/somerville-teacher-tool) [![Code Climate](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool/badges/gpa.svg)](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool)

Student Insights enables educators to see at-risk students and match them to the help they need.

- [Installation](#installation)
  - [Demo data](#demo-data)
  - [Real data](#real-data)
  - [Tests](#tests)
- [Deployment](#deployment)
    - [Heroku](#heroku)
    - [Your own server](#your-own-server)
- [User stories](#user-stories)
- [Design](#design)
  - [Who made this?](#who-made-this)
- [More](#more)

# Installation

This is a Ruby on Rails app and uses a PostgreSQL database.

Choose your favorite local development approach:

* [Local development with Docker](docs/local_development_with_docker.md)
* [Local installation on OSX and Debian](docs/local_installation_notes.md)

## Demo data

```
rake db:seed:demo
```

This will create demo students with fake student information. The demo educator username is `demo@example.com` and the demo password is `demo-password`.

Once you've created the data, start a local server by running `rails s` from the root of your project. When the local server is up and running, visit http://localhost:3000/ and log in with your demo login information. You should see the roster view for your data.

## Real data

If you're working with a real school district, you'll need flat files of the data you want to import.

Run an import task:

```
thor import:start
```

Use the `--district` flag to indicate your school district or charter organization. File formats and storage are configured in `app/importers/settings/settings.rb`.

So far, Student Insights can import CSV and JSON and can fetch data from AWS and SFTP. To import a new flat file type, write a new data transformer: `app/importers/data_transformers`. To import from a new storage location, write a new client: `app/importers/clients`.

## Tests
This app uses [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs) for Ruby tests. Run the test suite:

```
rspec
```

It uses [Jasmine](http://jasmine.github.io/) for JavaScript tests, run through the [Teaspoon](https://github.com/modeset/teaspoon) gem.  You can run them in the browser at `http://localhost:3000/teaspoon/default`.

# Deployment

### Heroku

We deployed this app on Heroku once and you can, too. Be sure to set config variables for DEVISE_SECRET_KEY and SECRET_KEY_BASE before deploying.

### Your own server

Our plan is to deploy Student Insights on Somerville Public Schools' machines and serve over their intranet. Capistrano does our deployment. Set `SERVER_NAME` in `config/initializers/capistrano.rb` and run:

```
cap production deploy
```

# User stories
* As an admin, I want to see which students are at risk and whether they are receiving necessary interventions.

* As a teacher, I want to see which students are at risk and target interventions to these students.

* As a teacher, I want to see how my students are doing both academically and behaviorally over time.

# Design
For a history of all design iterations look here:
https://www.dropbox.com/sh/r71hh9azun8v6as/AABtBghkPI4XUJBZjNpMmRdba?dl=0

## Who made this?
Alex, Amir, and Mari from Code for America's [Somerville Fellowship Team](http://www.codeforamerica.org/governments/somerville/) in collaboration with the City of Somerville and Somerville Public Schools --- and great support from the Code for SF and Code for Boston brigade volunteers!

# More

- __[Student Insights Demo](https://somerville-teacher-tool-demo.herokuapp.com/)__
    - username: `demo@example.com`
    - password: `demo-password`
- __[Team Somerville Mid-Year Report](http://codeforamerica.github.io/somerville-story/)__
