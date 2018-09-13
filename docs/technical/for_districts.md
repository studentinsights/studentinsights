# For districts

Adopting Student Insights at your district? Here's a rundown on what you'll need from a technical point of view.

## What is Student Insights?

Student Insights brings together data from SIS systems, educator notes, and external sources. It uses these data sources to help educators know their students more deeply and share what's going on with students.

## What do you need to do to get started with Insights?

To set up Insights for your district, we'll need to set up **authentication** and **data import**.

### For authentication

* How does your district supply authentication to third party apps and services?
  * Do you use LDAP?
    * How do educators expect to log in to services that use LDAP?
      * Do educators usually use an email address or a username to log in?
    * Which IP address and port should we use to query your LDAP server?
    * What should we know about how your district LDAP system works? What kind of questions do you have about how our system will query yours?
    * From our end, we'll send you a pair of static IP addresses to add to your allowlist.
    * On your end, we'll ask you to create an Insights-only developer account for us to test the LDAP connection and log in to Insights with.
  * Do you use Google?
    * This may take us more time to set up for you, because we haven't written a Google integration yet.
    * But we are happy to work with you on integrating with Google!
  * Do you use some other service?
    * Tell us about it and how it works!

### For data import

* Insights requires nightly CSV data dumps from your district's SIS.
  * What's the easiest way for you to export CSVs from your Student Information System? We already have scripts that you can you can re-use or adapt, depending on the details of your Aspen/X2 setup.
    * Custom SQL scripts: See `/x2_export` folder.
    * Aspen Hosted export function: Ask us about this.
    * Aspen export XML: Ask us about this.
    * Some other method?

* We'll set up a secure SFTP box for you to dump CSV data nightly.
  * All we need on your end is an RSA SSH public key that your Aspen export job can use. See this GitHub guide for more info: https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/.

* Are there other sources of data you'd like to import?
  * We already have code set up for importing STAR data.