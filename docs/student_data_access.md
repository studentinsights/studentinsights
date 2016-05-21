## Contributors & Student Data

Student Insights uses student data. Student data is private. So how does contributing to Student Insights work?!?

Below are four levels of access — from new folks who walk in the door at Code for Boston (no student data access), to signing a contract with Somerville to build out the project (full student data access).

----

1. __Contribute using demo data__

  + You don't need any real student data to contribute to Student Insights. With help from contributors, we've built out tools to generate fake data that will let you create a fake school district on your own laptop.
  + There's also a [demo site](https://somerville-teacher-tool-demo.herokuapp.com) so folks can get an understanding of the project without actual student data access.
  + See the main README for more information about both of these things.

2. __Admin on repo__

  + This lets you merge in PRs to `master` on GitHub. It doesn't give you access to student data, but the changes you merge in are quickly surfaced to the principals and teachers who use Student Insights.
  + _When this level of access makes sense:_
    + When you regularly submit high-quality PRs that don't need a lot of back-and-forth revision
    + When your PRs consistently fall under the project priority areas


3. __Staging site access, SFTP site keys, test account__

  + This gives you read access to all of the student data in the Somerville School District. You can use the staging site to see how your changes will look against real student data before merging.
  + _When this level of access makes sense:_
    + When you are already an admin on the repo, and lack of access to real data is a blocker to being able to contribute further (i.e. you often find yourself needing to ask other project members for distributions of real data or other info)
  + _Requirements:_
    + Meet the project leaders driving this work on the Somerville Public Schools side — they will want to meet with you in person before you get keys to real student data
    + Sign an MOU with Somerville to become an authorized agent of the district
    + Use a password manager for all Student Insights work
    + Read through the Laptop security doc
  + _Suggestion:_
    + Once you've signed an MOU, it's a great idea to observe an SST/MTSS meeting at a school that's using Student Insights, see first-hand how the tool is being used


4. __Collaborator on production site__

  + This gives you push access to the live production Student Insights instance.
  + _When this level of access makes sense:_
    + When you've contracted with Somerville Public Schools to work on the project. Since we push to production often (daily or at least a couple of times a week), if you're an admin on the repo and merge in PRs, your code will end up in production quickly whether or not you're a collaborator on the production site.
