
# Merging code and deploying to Heroku

This is meant to be a quick walk through to the mental checklists we go through when we merge and deploy code.

## Merging

Two rules of thumb:

+ **"Merge early and often."**

  It's easier to complete a big feature by breaking it into a bunch of smaller pieces, merging them in one step at a time, and testing in production at each step. It also avoids dealing with big merge conflicts.

+ **"Make sure specs pass and do some local QA, *especially* when you touch authorization or authentication."**

  That said, we don't want to be merging in code willy-nilly. Specs are an important way to make sure the code we're writing does what we think it does. If you're adding a new feature, add specs along with the feature before you merge it in. And when I write a PR that touches authorization or authentication logic, I exercise it extensively in my local environment first before merging.

To merge in code, all you need to do is push a button on the GitHub website:

![Merge button on GitHub](../readme-images/merge-button.png)

If you realize you've made a mistake after you merged, GitHub offers a Revert button to create a new PR that will reverse the changes:

![Revert button on GitHub](../readme-images/revert-button.png)

There's no automatic deployment set up, so your code will not go into production until you or another dev deploy it.

## Deploying

### Migrations on Heroku

This is how to execute a standard Rails migration.  This is focused on the production deployment, but the demo site is the same, just add `--app somerville-teacher-tool-demo` to the Heroku CLI commands.

  - db:migrate isn't run as part of the deploy process and needs to be done manually
  - in order to `heroku run rake db:migrate` in production, the migration code needs to be merged to master and deployed to heroku
  - this means the commit adding migrations needs to work both with and without the migrations having been run
  - after deploying, you can run the migration and restart Rails through the Heroku CLI

So concretely, once your commit is on master, `git push heroku master && heroku run rake db:migrate` will deploy the new code and run the migration.  This will cause a few seconds of downtime.
