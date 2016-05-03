# Student Insights

[![Build Status](https://travis-ci.org/studentinsights/studentinsights.svg?branch=master)](https://travis-ci.org/studentinsights/studentinsights)
[![Code Climate](https://codeclimate.com/github/studentinsights/studentinsights/badges/gpa.svg)](https://codeclimate.com/github/studentinsights/studentinsights)

Student Insights gives educators an overview of student progress at their school, classroom-level rosters and individual student profiles.  It also allows them to capture interventions and notes during weekly or bi-weekly student support meetings focused on the most at-risk students.  It’s currently in use at the pilot elementary school in Somerville.

Check out the [demo site](https://somerville-teacher-tool-demo.herokuapp.com/):
  - username: `demo@example.com`
  - password: `demo-password`

## User personas: Who we're serving
There are three main user personas we're serving. Principals, Interventionists and Classroom Teachers. Right now we're focused primarily on serving principals, and the rough progression will likely be to Interventionists next. Early adopter Classroom Teachers are great, but focused on scaling adoption across all classroom teachers isn't a priority yet.

Principals are responsible for a school, from ensuring all students are progressing academically to making hiring and staffing decisions for teachers.

Interventionists are typically folks who provide some kind of specialized service to students, like counseling, behavioral services or specialized reading instruction. They have caseloads of 20-70 students and are often involved in interdisciplinary teams focused on supporting students who are most at-risk.

Classroom Teachers are responsible for teaching all subjects in an elementary level, and at the middle school level typically teach two subjects, with a few periods of each subject.

## Product overview: How we're helping
#### School overview
Principals and intervention specialists can get an overview of all students at school, updated automatically as new data comes in.  This includes demographic information (left), academic progress indicators (center), and educational interventions (right).

![Overview](docs/readme_images/overview-summary.png)

Educators answer specific questions like "how are 3rd grade students doing on reading assessments?" and "are students on free lunch programs equitably distributed between 5th grade classrooms?"  This is useful for understanding progress for groups of students, and also for identifying particular students in need of targeted interventions.

![Filtering](docs/readme_images/overview-filtered.png)

Data can be exported as a CSV for more sophisticated analysis.

#### Classroom rosters
Classroom teachers can see rosters of all students in their classroom, calling out high-need students and letting them jump into the student's case history and record of previous assessments and interventions.

![Rosters](docs/readme_images/roster.png)

#### Student profiles
Individual student profiles show how students are progressing on core academic skills, as measured summatively by MCAS or on more frequent formative measures like STAR assessments.

![Profile](docs/readme_images/profile-summary-screenshot.png)

Student profiles also contain the full case history of demographic information, attendance and behavioral support.

![Profile](docs/readme_images/profile-full-case-history-screenshot.png)

We're working on some big improvements to the student profile page right now, check out [#5](https://github.com/studentinsights/studentinsights/issues/5) for more background.


#### Capturing meeting notes and interventions
It's one thing to have data, but acting on it to improve student outcomes is what really matters.  Schools with regular student support meetings for at-risk students can track interventions like additional tutoring hours, attendance contracts or social skills groups.  This is a building block to close the loop and monitor how effectively these interventions are serving students.

![Interventions](docs/readme_images/recording-services-screenshot.png)

It also allows capturing meeting notes as part of the student's record, which is particularly important on interdisciplinary teams.

#### User experience
This is a web product, integrated with the Aspen SIS, district LDAP authorization and STAR assessments.  Principals and teachers sign in using their usual credentials, and can access the product securely anywhere they have internet access.


## Project priorities
These are tracked in GitHub with [milestones](https://github.com/studentinsights/studentinsights/milestones).

## Contributing
We'd love your help! Take a look at **[CONTRIBUTING.md](CONTRIBUTING.md)** for more information on ways educators, developers and others can get involved and contribute directly to the project.  You can also learn how to join our online chat channel and submit pull requests and join us in person at our weekly hack night with Code for America, in Kendall Square, Cambridge.

## How it works
The project is a Rails app with a Postgres database.  There are background tasks that replicate data from the Aspen SIS system and STAR assessment system into the Postgres database.  This enables rapid iteration and experimentation on new product features with minimal risk to these existing production systems.  The Postgres database is the system of record for unique data captured by the Student Insights product (eg., notes from clinical meetings and information about targeted interventions that students are receiving).  Authentication is handled by the district's LDAP service.

![how it works](docs/readme_images/how_it_works.png)


## Development Environment

This is a Ruby on Rails app that uses a PostgreSQL database, and relies on React for much of the UI code.

#### 1. Install dependencies

Choose your favorite local development approach:

* [Local development with Docker](docs/local_development_with_docker.md)
* [Local installation on OSX or Linux](docs/local_installation_notes.md)

#### 2. Create database tables and seed them with demo data

```
bundle exec rake db:create db:migrate db:seed:demo
```

This will create demo students with fake student information. The demo educator username is `demo@example.com` and the demo password is `demo-password`.

#### 3. Start Rails
Once you've created the data, start a local server by running `rails s` from the root of your project. When the local server is up and running, visit http://localhost:3000/ and log in with your demo login information. You should see the roster view for your data.

#### 4. Run the tests
This app uses [Rspec](https://www.relishapp.com/rspec/rspec-rails/v/3-2/docs). Run the test suite:

```
rspec
```

It uses [Jasmine](http://jasmine.github.io/) for JavaScript tests, run through the [Teaspoon](https://github.com/modeset/teaspoon) gem.  You can run them in the browser at `http://localhost:3000/teaspoon/default`.

You can also run them from the command line:

```
teaspoon
```
#### 5. Write code!
This project is a Rails app and has a typical Rails project structure.  If you'd like to get up to speed on Rails, we recommend checking out their [great documentation](http://guides.rubyonrails.org/).

It also uses React for much the user interface code, with one minor wrinkle (see below).  If you'd like to get up to speed on React, we recommend their great documentation, and the [Tutorial](https://facebook.github.io/react/docs/tutorial.html) and [Thinking in React](https://facebook.github.io/react/docs/thinking-in-react.html) pages in particular.

The wrinkle with React usage is that at the moment, we don't use the JSX syntax but instead call methods directly.  This is just a syntatic change and means:

```
var ProductTable = React.createClass({
  render: function() {
    var rows = [];
    this.props.products.forEach(function(product) {
      rows.push(<ProductRow product={product} key={product.name} />);
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  }
});
```

becomes:

```
var ProductTable = React.createClass({
  render: function() {
    var rows = [];
    this.props.products.forEach(function(product) {
      rows.push(createEl(ProductRow, { product: product, key: product.name }));
    });
    return (
      dom.table({},
        dom.thead({},
          dom.tr({},
            dom.th({}, 'Name'),
            dom.th({}, 'Price')
          )
        ),
        dom.tbody({}, rows)
      )
    );
  }
});
```

There are also a few places where we use [Flux](https://facebook.github.io/flux/docs/overview.html) patterns.

## Browser/OS Targeting

Category | Target | Comment
--- | --- | ---
Browser | IE 11 | "Should be all IE 11 by now." <br>    – John Breslin, Technology Department, Somerville Public Schools
OS | Windows 7 and 8.1 | "Maybe some Win10 next year." <br>    – John Breslin, Technology Department, Somerville Public Schools


## Deployment
### Importing real data

If you're working with a real school district, you'll need flat files of the data you want to import.

Run an import task:

```
thor import:start
```

So far, Student Insights can import CSV and JSON and can fetch data from AWS and SFTP. To import a new flat file type, write a new data transformer: `app/importers/data_transformers`. To import from a new storage location, write a new client: `app/importers/clients`.

### LDAP

The project is configured to use LDAP as its authentication strategy in production. To use database authentication (in a production demo site, for example) set the `SHOULD_USE_LDAP` environment variable. Authentication strategies are defined in `educator.rb`.

### Heroku

We deployed this app on Heroku and you can, too.

[Quotaguard Static](https://www.quotaguard.com/static-ip), a Heroku add-on, provides the static IP addresses needed to connect with Somerville's LDAP server behind a firewall. This requires additional configuration to prevent Quotaguard Static from interfering with the connection between application and database. One way to accomplish this is to set a `QUOTAGUARDSTATIC_MASK` environment variable that routes only outbound traffic to certain IP subnets using the static IPs. [Read Quotaguard Static's documentation for more information.](https://devcenter.heroku.com/articles/quotaguardstatic#socks-proxy-setup)

Set strong secret keys for `DEVISE_SECRET_KEY` and `SECRET_KEY_BASE` when you deploy.

##### Migrations on Heroku
This is how to execute a standard Rails migration.  This is focused on the production deployment, but the demo site is the same, just add `--app somerville-teacher-tool-demo` to the Heroku CLI commands.

  - db:migrate isn't run as part of the deploy process and needs to be done manually
  - in order to `heroku run rake db:migrate` in production, the migration code needs to be merged to master and deployed to heroku
  - this means the commit adding migrations needs to work both with and without the migrations having been run
  - after deploying, you can run the migration and restart Rails through the Heroku CLI

So concretely, once your commit is on master, `git push heroku master && heroku run rake db:migrate` will deploy the new code and run the migration.  This will cause a few seconds of downtime.

##### Rebuilding database in staging environment
Rebuilding the database in a staging deployment is a destructive action and permanently deletes data in the staging environment.

To do this:

```
# drop database
heroku pg:reset DATABASE --app student-insights-staging

# create database tables, run migrations and seed
heroku run bundle exec rake db:create db:migrate db:seed:somerville --app student-insights-staging

# import data
heroku run:detached thor import:start --app student-insights-staging
```

### AWS

The project can also be deployed on AWS.  There's a starting point for provisioning and deploying scripts here:

```
/scripts/aws/
```

Scripts by the fantastic [Kevin Robinson](https://github.com/kevinrobinson).

### Your own server

Deploy on your own Ubuntu server (not AWS's or Heroku's):

https://github.com/codeforamerica/promptly-deploy-scripts/tree/somerville-v1



## More information
- __[Team Somerville Mid-Year Report](http://codeforamerica.github.io/somerville-story/)__
- [Drop into chat](https://cfb-public.slack.com/messages/somerville-schools/), [sign up for Slack](http://public.codeforboston.org/)
- Connect with [Alex](https://twitter.com/alexsoble) or [Kevin](https://twitter.com/krob) on Twitter
