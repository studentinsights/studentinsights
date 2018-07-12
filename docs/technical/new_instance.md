# Creating a new Insights instance
The overall idea is strong isolation across districts, which means some initial setup overhead.  Here's how you do it!  More detailed notes for various steps are below.

### 1: Stand up an instance
Goal: Visit the home page signed-out
- Add domain
- New Heroku app with Node/Ruby buildpacks, grant access to team
- Review and set environment variables (minimally)
- Review and update `PerDistrict.rb` class (minimally)
- Review and add Heroku scheduler jobs (minimally)
- Set up Postgres and seed database (minimally)
- Set up Logentries
- Set up Rollbar
- Set up Mixpanel
- Set up CSP and CSP logger

### 2: Sign in
Goal: Sign in as developer, see empty home page, roster page, districtwide pages
- Create developer user

### 3: Import first data
Goal: Sign in as districtwide educator, use the home page, roster page, student profile page, take notes for students in support meetings
- Create a new EC2 instance for receiving data (maybe with static IPs, grant access to team)
- `EducatorsImporter` and validate
- `StudentsImporter` and validate
- Review permissions with district partner
- Set up Mailgun and enable usage emails 

### 4: Enable additional features, or ensure disabled
Goal: Educators using additional feature (eg, "insights box" for absences) or using additional data within support meetings (eg BBST).
- Student photos (with AWS config, grant access to team)
- IEP PDFs (with AWS config, grant access to team)
- `AttendanceImporter` and validate
- `BehaviorImporter` and validate
- ACCESS and validate
- Next Gen MCAS and validate
- Old school MCAS and validate
- DIBELS and validate
- STAR and validate
- HS Courses and Sections for authorization
- HS grades
- Class lists
- Review `PerDistrict`

### 5: Final review
- Review ENV variables
- Review `PerDistrict`
- Review scheduled jobs
- Review Puma tuning (eg, WEB_CONCURRENCY)
- Load test or scale accordingly


# Various other details
This section has some more details about different bits above.  It's not super organized, and is more a loose collection of how to do different things than a walkthrough or automated process.

### New Heroku instance

Insights uses a separate-instance strategy for new districts (one database and one Heroku app per district).

Set up a new district with this script:

```
$ scripts/deploy/new_district.sh "My New District Name"
```

This sets up a new Heroku app instance with the Student Insights code and copies over some basic configuration around the district name. It doesn't include tooling for connecting with a Student Information System or other district-level data sources.

### New SFTP Site

In addition to a Heroku instance, you'll need an SFTP site to hold data as it flows between the district IT systems and Student Insights.

We're documenting a few ways to set up and secure the SFTP site:

+ New District SFTP Setup With Private Key (Strongly Preferred!)

#### New District SFTP Setup with Password

To set up an Insights instance, we need an SFTP server where data will sync nightly. The best option is to used private keys to secure the SFTP server, but some hosted Aspen/X2 instances are preconfigured to work with a username/password. We can work with that. Ideally password authentication is a temporary step and the site transitions over to public key auth before it reaches full deployment to a school or district.

#### Steps

1. Log onto AWS using the secure, two-factor-protected SFTP account
2. Create a new EC2 Ubuntu instance
3. Log into the new EC2 instance using the private key provided by AWS
4. Edit the config file

```
sudo vi /etc/ssh/sshd_config

# vim:

PasswordAuthentication yes
```

5. Become the root user: `sudo -s`
6. Add a new district: `adduser [[new_district_name]]`
7. Set a secure passphrase with letters, numbers, and symbols
8. The system will prompt you for info like Name, Office, and Phone Number, you can leave all that blank because it doesn't matter
9. Restart the ssh service: `service ssh restart`
10. Call up the new district on the phone and tell them their passphrase, never share the passphrase in plaintext over email


### Importing data

There are two parts to importing data into a Student Insights instance: getting data out of the school SIS, and getting data into Student Insights.

#### Getting data out of the SIS

![](docs/readme_images/sis-to-sftp.jpg)

This is going to vary widely from district to district. Districts use different Student Information Systems (SISes), and there's no common path for getting data out of SISes into a standardized form.

As a project, Student Insights has the most experience extracting data from Aspen/X2 SISes.

##### Self-Hosted Aspen

Somerville Public Schools hosts its own instance of the Aspen/X2 SIS.

It runs the SQL scripts in the `/x2_export` directory nightly to extract data from its SIS.

If your district self-hosts Aspen/X2, the scripts in `/x2_export` are the best place to start.

##### Hosted Aspen

New Bedford Public Schools also uses Aspen/X2, but their instance is hosted by the company that creates Aspen/X2.

We are currently working on this integration and will share more instructions and code as we learn!

#### Getting data into Insights

![](docs/readme_images/sftp-to-insights.jpg)

Once your district has got data out of its SIS, the next step is to bring the data into Insights.

Each district names its export files according to their own naming convention. We need to tell Insights what remote filenames to look for on the SFTP site. We also need to tell Insights what schools exist in those districts.

There are a few parts to the configuration: an `ENV['DISTRICT_KEY']`, other ENV variables, `PerDistrict`, and a YAML config file.

##### Setting `ENV['DISTRICT_KEY']`

This is the canonical key for the district. Use a slug-style string, like `"somerville"` or `"new_bedford"`.

Locally, change this key by editing the `development.rb` or `test.rb` config files. Currently it defaults to `"somerville"` in both of these environments, since the codebase was built for Somerville and some code (i.e. test code) assumes Somerville as the district.

In a production Heroku instance, set this key by either running `heroku config:set DISTRICT_KEY={{key_goes_here}}`, or through the Heroku UI.

##### Setting other ENV variables

In addition to the DISTRICT_KEY, there are a few other variables you'll need to set in ENV. These are credentials for the nightly import process. They are stored in ENV because they are sensitive and need to be kept secret.

These variables are:

+ `SIS_SFTP_HOST`,
+ `SIS_SFTP_USER`,
+ `SIS_SFTP_KEY` or `STAR_SFTP_PASSWORD`

Key-based authentication is preferred, but sometimes we need to use password-based if key-based auth is a major obstacle for a school district or a vendor.

In production, set variables through the command line or the Heroku UI just like with `ENV['DISTRICT_KEY']`. If you need to work with real SIS access locally, create a temporary local env file:

```
touch config/local_env.yml
```

The values in this file are read in as ENV by the `development.rb` file. This file is `.gitignore`d because we need to keep sensitive values out of git source control and out of GitHub.

##### Creating a YAML config file

The third step to configuring a new district is to create a public YAML file with non-sensitive configuration information, like which schools are in the district.

Configure that data by creating a new district configuration file under `/config`. You can use one of these files as examples:

```
* /config/district_somerville.yml
* /config/district_new_bedford.yml
```

Once you have your own YAML configuration file set up, tell the `DistrictConfig` object where to look for it. Update the `district_key_to_config_file` method in `app/config_objects/district_config.rb`.

##### Running the import job

Once you have the config set up, run an import job as minimally as possible (eg, a single importer or scoped for a particular school):

```
thor import:start --source educators --school '123'
```

This job has fairly verbose logging output that you can use to debug and tweak the import process for your own district.
