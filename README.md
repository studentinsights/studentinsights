# Student Insights

[![Build Status](https://travis-ci.org/codeforamerica/somerville-teacher-tool.svg?branch=master)](https://travis-ci.org/codeforamerica/somerville-teacher-tool) [![Code Climate](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool/badges/gpa.svg)](https://codeclimate.com/github/codeforamerica/somerville-teacher-tool)

Student Insights enables educators to see at-risk students and match them to the help they need.

#### User stories
* As an admin, I want to see which students are at risk and whether they are receiving necessary interventions.

* As a teacher, I want to see which students are at risk and target interventions to these students.

* As a teacher, I want to see how my students are doing both academically and behaviorally over time.

## Installation
This is a Ruby on Rails app and uses a PostgreSQL database. See Code for America's "HowTo" on Rails for more information on deploying and maintaining apps using Rails: https://github.com/codeforamerica/howto/blob/master/Rails.md

On a Debian-like OS you may have to remove this line from the config of the development database (config/database.yml)
```
host: localhost
```
(For an explanation see [this Stackoverflow discussion](http://stackoverflow.com/questions/23375740/pgconnectionbad-fe-sendauth-no-password-supplied))

### Postgres installation on OSX
You can use Homebrew to install Postgres: `brew install postgres`
There's good information about how to use it at: `brew info postgres`
And you can start a Postgres server with `postgres -D /usr/local/var/postgres`

### Puma installation on El Capitan
On El Capitan, Puma expects headers for a version of OpenSSL that is no longer included in the OS.  This will cause `bundle install` to fail.  See https://github.com/puma/puma/issues/718 for more information.

You can workaround like this:

```
bundle config build.puma --with-opt-include=/usr/local/opt/openssl/include
bundle install
```

### Setting up demo data

To set up demo data after you clone the project, run

```
rake db:seed:demo
```

This will create demo students with fake student information. The demo educator username is `demo@example.com` and the demo password is `demo-password`.

Once you've created the data, start a local server by running `rails s` from the root of your project. When the local server is up and running, visit http://localhost:3000/ and log in with your demo login information. You should see the roster view for your data.

### Importing real data

If you're working with a real school district, you'll need flat files of the data you want to import.

Run an import task:

```
thor import:start
```

Use the `--district` flag to indicate your school district or charter organization. File formats and storage are configured in `app/importers/settings/settings.rb`.

So far, Student Insights can import CSV and JSON and can fetch data from AWS and SFTP. To import a new flat file type, write a new data transformer: `app/importers/data_transformers`. To import from a new storage location, write a new client: `app/importers/clients`.

### Tests
This app uses [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs). Run the test suite:

```
rspec
```

#### Pre-commit
This app comes with a suggested pre-commit file that you can add to your git hooks. It will run the tests before committing, so you can be sure any changes are kosher.

Add to your git hooks:

```
cp pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

If you have a good reason to skip the test suite:

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

## More

* __[Student Insights Demo](https://somerville-teacher-tool-demo.herokuapp.com/)__
 * username: `demo@example.com`
 * password: `demo-password`
* __[Team Somerville Mid-Year Report](http://codeforamerica.github.io/somerville-story/)__
