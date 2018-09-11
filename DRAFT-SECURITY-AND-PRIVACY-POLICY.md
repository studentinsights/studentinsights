# DRAFT Security & Privacy Policy

## Big-Picture Goal

Our goal is to earn and keep the trust of students, parents, and staff by treating student data with upmost care and confidentiality and complying carefully with regulations.

## Table of Contents

- [FERPA](#ferpa)
- [Data security](#data-security)
- [Physical security](#physical-security)
- [Password security](#password-security)
- [Application security](#application-security)
- [Third-party security](#third-party-security)
- [Security process and culture](#security-process-and-culture)

## FERPA

+ Stay familiar with FERPA, especially Uri's go-to resource: [FERPA Frequently Asked Questions page from the U.S. Department of Education](http://familypolicy.ed.gov/faq-page/13).
+ One key FERPA provision is about access and controls: *"An educational agency or institution must use reasonable methods to ensure that school officials obtain access to only those education records in which they have legitimate educational interests."*
+ Districtwide administrators can set permissions using the Adjust Educator Permissions dashboard.
  + School district administrators who use Student Insights are responsible for setting their district's permissions in a way that complies with FERPA.
  + Developers importing educator data to Student Insights are responsible for setting defaults that err on the side of caution with respect to student records access.

## Data security

+ Less is better: “Only store as much personal information as is absolutely required for the business.” ([Datensparsamkeit, definition via Thoughtbot](https://www.thoughtworks.com/radar/techniques/datensparsamkeit))

## Physical security

For developers working with student data files:

+ Aim to never store data locally on the laptop.
+ Run the cleanup script whenever you finish a work session that uses production data:

```
./scripts/cleanup/cleanup.sh
```

Follow [these physical security guidelines from Thoughtbot](https://github.com/thoughtbot/guides/tree/master/security#physical-security):

+ Lock your device when you are away from it.
+ Don't leave your devices unattended in an unsecured area.
+ Install a device tracking and remote data wipe tool such as Prey.

## Password security

+ Always store passwords in a locked password manager.
+ Log out of the password manager at the end of the work session.
+ Use a long, unique password or passphrase to access Insights and change it from time to time.
+ Do not share your Insights password with anyone.

For developers:

+ Enable 2-factor auth for Heroku and other services that access sensitive data.
+ After working with Heroku, type `heroku logout` to clear local credentials.

## Application security

For developers:

+ Insights uses SSL by default and enforces SSL at the application level (currently enforced by `ApplicationController#force_ssl`). Do not relax SSL requirements for Insights.
+ When changing parts of the codebase that handle authentication or authorization, always ensure thorough test coverage and request a code review from another developer on the team.
+ Keep gems, JS libraries, and other dependencies up-to-date.

## Third-party security

+ Aim to have student data touch as few third-party services as possible.
+ Right now, the list of third-party services that either store or transfer student data is:
  + Heroku
  + AWS S3
  + QuotaGuard
  + MailGun
  + Scout
  + Rollbar (some Rollbar error report emails expose sensitive information)

## Security process and culture

+ All developers who work on Insights should:
  + review these guidelines,
  + agree to follow them before working on Insights,
  + raise and questions or new ideas they might have about how to improve security.

+ All district administrators who want to use Insights in their district should:
  + read these guidelines,
  + agree to follow them before bringing Insights to their district,
  + raise and questions or new ideas they might have about how to improve security.

+ No one working on Insights should hesitate to share information or ideas about security. If you spot a bug related to security, contact Alex and Kevin right away.
If you have an idea for improving security, share it with the developers on the team for feedback.
