{% include navbar.html %}

# Privacy policy
*Last updated on 1/29/18*

- [Introduction](#introduction)
- [What is the relationship between Student Insights and school districts?](#what-is-the-relationship-between-student-insights-and-school-districts)
- [How do we protect student privacy and data security?](#how-do-we-protect-student-privacy-and-data-security)
- [Where is data stored?](#where-is-data-stored)
- [What student data is stored, and why?](#what-student-data-is-stored-and-why)
- [Who can access student data?](#who-can-access-student-data)
- [What educator data is stored and why?](#what-educator-data-is-stored-and-why)
- [What will happen if data is breached?](#what-will-happen-if-data-is-breached)
- [What will happen if funding is cut?](#what-will-happen-if-funding-is-cut)

### Introduction
We view privacy as a fundamental right that needs to be carefully safeguarded.

We worry about how much data companies collect on us and children.  In some cases, this data is sold and shared with other companies for marketing, advertising or profiling.  We help school communities take control of how they use technology and safeguard student data.

We welcome collaboration with others commited to open, secure and privacy-first school data systems.


### What is the relationship between Student Insights and school districts?
Student Insights is under the direct control of the school or district with regard to the use and maintenance of education records.  Under the federal federal Family Educational Rights and Privacy Act (FERPA), Student Insights can use education records only for authorized purposes and cannot re-disclose any personally identifiable information from education records to other parties.  Like all educational records, Students and parents can request access to the data stored in Student Insights at any time through the school or district.    Student Insights does not disclose any public “directory information.”

Only information that is needed for Student Insights to perform services, which are outsourced to Student Insights by school districts, is disclosed to Student Insights.  These disclosures are authorized by the federal Family Educational Rights and Privacy Act (FERPA).  Student Insights considers Student Data to be strictly confidential and do not use student data for any purpose other than improving and providing our products and services to the school districts or on their behalf.  Our collection, use, and sharing of Student Data is governed by our contracts with the school districts, the provisions of FERPA, and other applicable state and federal laws and regulations that relate to the collection and use of personal information of students.


### How do we protect student privacy and data security?
The protection of individual sensitive and personally identifiable information is the highest priority for Student Insights.  As threats to school data systems evolves, we continue to add defenses and additional security measures to ensure student information is private and secure.  Even if it means developing fewer features, we promise to allocate time and energy to this important work.  Our project priorities and changelog are public, and if we are not living up to this promise, please contact us at <a href="mailto:{{site.links.email}}">{{site.links.email}}</a>.

Student Insights regularly invests time in auditing our own security practices and upgrading our technologies that support the protection and provide security of data.  Our security features are designed to provide physical and digital security and empower districts to develop, enact, and enforce their privacy policies. Student Insights employs a variety of physical, administrative, and technological safeguards that are designed to protect personal information against loss, misuse, and unauthorized access or disclosure.  We strive to continuously enhance our technical and operational security measures.  Our measures consider the type and sensitivity of the data being collected, used, and stored, and the current state of technology and threats to information.   Student Insights’ security measures include data encryption, firewalls, data use and access limitations for personnel and vendors, and physical access controls to our facilities.  Student Insights performs regular quarterly audits of its security systems to ensure the highest and most updated levels of security.  For more information about our data security, please contact us at <a href="mailto:{{site.links.email}}">{{site.links.email}}</a>.

As free software and an open-source project, we welcome contributions from privacy experts,  security researchers, and certification experts.  If you are interested in contributing, or participating in responsible disclosure, please contact us.


### What student data is stored, and why?
Student Insights only collects and stores student personal data for the purposes of providing the services that districts have asked us to provided, in accordance to theri instructions and the terms of the contract.  Student data can be revised or destroyed upon request.

We will not retain student personal information for any longer than is necessary for educational purposes and legal obligations, or to provide the service for which we receive or collect student personal information.


### Where is data stored?
Currently, we use the following vendors to help us provide cloud hosting services services to a school district: Heroku, Amazon Web Services, Logentries, QuotaGuard, and Rollbar.  When communicating with district partners separately, we also use district Google Drive or G Suite systems.  We limit the set of third-party service providers to those that are necessary for developing and providing our services (such as database hosting) and promise to be transparent about who these service providers are.

Each district uses an isolated instance of Student Insights.  As an example, student data for Somerville is stored on different server instances than student data for New Bedford.


### Who can access student data?
Student Insights fine-grained access controls, School districts control who should have access to student data, and limit that to what is necessary to support the students they are responsible for.  We have created various levels of permissions for different roles and scopes of responsibility, and will continue to actively refine these with districts.

See <a href="{{site.links.roles_and_permissions}}">Student Insights: Roles and Permissions (shared)</a>.


### What educator data is stored and why?
We store educator data (name, school email address, role, and courses taught) for four purposes: to securely provide access to student data, to enable security measures against attackers, for information about software crashes or bugs, and to understand aggregate usage patterns.  All usage data is stored directly within Student Insights, Logentries or Rollbar.

In order to provide educators with secure access to student data within Student Insights, and to limit which student data individual educators can access, we store educator data including name, school email address, role, as well as additional data related to access permissions (eg, which courses they teach, whether they should have school-wide access as an administrator).  In order to sign in, Student Insights uses cookies to securely store login and session information.  For more details, see the open source code or contact us.

To enable security measures, we store the educator's IP address so that we can block access from attackers based on their IP address (eg, bots running within data centers).

In order to discover and respond to software crashes and bugs, we collect device and usage information when errors occur and store these in Rollbar.  This is scrubbed for student data, but does allow connecting the error report information to individual users, so that we can communicate and resolve the issue.  This process collects additional data including information about the current browser and IP address.

To understand aggregate usage patterns, we store usage data so that we can compute how many users are signed in each week, which we review in aggregate each week.  At other points, we have reviewed anonymized aggregate data at the request of educators to facilitate reflection and plan workshops and trainings.


### What will happen if data is breached?
You have the right to immediately know if there’s been a security breach that threatens the safety of your students’ data, the extent of it, and what we’re doing to address it.  In the event of a data breach, we'll notify the district, student and families within 24 hours, and publicly publish a retrospective within 7 days.


### What will happen if funding is cut?
We'll partner with districts to move their data to another system anytime they want, and team members commit to volunteer to do this at no cost even if our team runs out of funding or they are no longer employed by the district.


<a href="mailto:{{site.links.email}}" class="btn btn-narrow"><b>Email us to talk more</b></a>

{% include footer.html %}