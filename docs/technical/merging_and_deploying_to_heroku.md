
# Merging code and deploying to Heroku

This is meant to be a quick walk through to the mental checklists we go through when we merge and deploy code.

## Merging

Two rules of thumb:

+ **"Merge early and often."**

  It's easier to complete a big feature by breaking it into a bunch of smaller pieces, merging them in one step at a time, and testing in production at each step. It also avoids dealing with big merge conflicts.  For large features with interdependent changes, another tactic is to deploy code "dark," meaning that it is in production but disabled from running via a flag or environment variable.

+ **"Make sure specs pass and do some local QA, *especially* when you touch authorization or authentication."**

  That said, we don't want to be merging in code willy-nilly. Specs are an important way to make sure the code we're writing does what we think it does. If you're adding a new feature, add specs along with the feature before you merge it in. And when I write a PR that touches authorization or authentication logic, I exercise it extensively in my local environment first before merging.

To merge in code, all you need to do is push a button on the GitHub website:

![Merge button on GitHub](https://github.com/studentinsights/studentinsights/blob/master/docs/readme_images/merge-button.png)

If you realize you've made a mistake after you merged, GitHub offers a Revert button to create a new PR that will reverse the changes:

![Revert button on GitHub](https://github.com/studentinsights/studentinsights/blob/master/docs/readme_images/revert-button.png)

There's no automatic deployment set up, so your code will not go into production until you or another dev deploy it.

## Deploying

### Commands

```
./scripts/deploy/deploy.sh {{HEROKU-APP-FOR-SOMERVILLE-PROD-SITE}} {{HEROKU-APP-FOR-DEMO-SITE}}
```

### After deploying

+ **Manual QA**. Poke around the production project to triple-check that everything looks right.
+ **Keep an eye on the logs**. We use Logentries. We also have a custom ErrorMailer that will email you with any errors that come up in the precomputing or data import jobs. Keep a close eye on these if you touch those areas of the codebase. Note (Alex): At some point we should think about setting up Airbrake, in my experience it's better than Logentries or Rollbar about notifying and capturing errors.
