### Migrations on Heroku

This is how to execute a standard Rails migration.  This is focused on the production deployment, but the demo site is the same, just add `--app somerville-teacher-tool-demo` to the Heroku CLI commands.

  - db:migrate isn't run as part of the deploy process and needs to be done manually
  - in order to `heroku run rake db:migrate` in production, the migration code needs to be merged to master and deployed to heroku
  - this means the commit adding migrations needs to work both with and without the migrations having been run
  - after deploying, you can run the migration and restart Rails through the Heroku CLI

So concretely, once your commit is on master, `git push heroku master && heroku run rake db:migrate` will deploy the new code and run the migration.  This will cause a few seconds of downtime.
