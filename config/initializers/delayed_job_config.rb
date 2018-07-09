# `max_run_time` controls two different things.
#
# First, it acts as a timeout and the worker process
# will abort jobs that take longer than this (see the timeout code here https://github.com/collectiveidea/delayed_job/blob/master/lib/delayed/worker.rb#L230).
#
# Second, it controls how long to wait until taking over a job that has been locked but not completed or not
# failed (eg, the worker process was forcibly killed).  So in effect, this means "how long does a worker have
# to wait before an abandoned job is considered released and the worker can reserve that job to try again."
# 
# Also, there is a bug in the call to `#reserve` between the `delayed_job` and `delayed_job_active_record` gems,
# which means that the per-job value is not respected.  We can patch that on the call side or on the receiving side,
# but to work around for now we just set that value here.
# call side: https://github.com/collectiveidea/delayed_job/blob/master/lib/delayed/worker.rb#L316
# receiving side: https://github.com/collectiveidea/delayed_job_active_record/blob/master/lib/delayed/backend/active_record.rb#L74
Delayed::Worker.max_run_time = 2.hours

# For the import job, we want it to run as one big job since the steps are sequential and dependent
# on running in a particular order.  The job overall is idempotent, but dependending on where it fails,
# the database may be in a somewhat inconsistent state (eg, only some records in a table are updated but
# others are still stale).  We tolerate that, and on failure re-run the entire job.
Delayed::Worker.max_attempts = 2

# For jobs that have hit errors or failed more than `max_attempts`, this will leave the record in the database
# so we can look at it, but the `failed_at` timestamp will be set so that it is not worked anymore.
Delayed::Worker.destroy_failed_jobs = false

# This is for handling different failure cases.
# 
# Heroku regularly restarts dynos, and also restarts them on config changes (eg, an environment variable is
# changed).  In this case it sends SIGTERM, and we can use `raise_signal_exceptions` to catch that.  Then we
# can either cleanup the job and exit for it to be considered completed successfully, or we can re-raise
# so that the job is considered a failure.  When re-raising, this will run the normal delayed job failure 
# handling paths, and set `last_error` on the job and reschedule it for its next run.
#
# Another failure case is running out of memory, (where Heroku sends SIGKILL).  In that case, the job will be 
# forcibly killed and abandoned, so it won't be re-run until the `max_run_time` window has passed.
#
# More reading:
# see https://github.com/collectiveidea/delayed_job#gory-details
# https://stackoverflow.com/questions/10438100/long-running-delayed-job-jobs-stay-locked-after-a-restart-on-heroku
Delayed::Worker.raise_signal_exceptions = true

