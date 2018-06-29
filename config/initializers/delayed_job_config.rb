# This is overridden in specific jobs.  Note that this does not determine the maximum time a job 
# can run before being killed - it actually describes how long to wait until taking over a job
# that has been locked.  So in effect, this means "how long does a worker have to release until
# the system takes that job back and retries it."
Delayed::Worker.max_run_time = 2.hours

# For the import job, we want it to run as one big job since the steps are sequential and dependent
# on running in a particular order.  The job overall is idempotent, but dependending on where it fails,
# the database may be in a somewhat inconsistent state (eg, only some records in a table are updated but
# others are still stale).  We tolerate that, and on failure re-run the entire job.
Delayed::Worker.max_attempts = 2
Delayed::Worker.destroy_failed_jobs = false

# Some failure cases we've seen are running out of memory (SIGKILL) or a dyno restart from a config
# change, when Heroku sends a SIGTERM and then SIGKILL.  In that case, we want want the job to be retried
# one more time and then not retried anymore if it fails the second time.
#
# If we didn't set `raise_signal_exception`, when the task was killed the job would stay locked and
# when the worker dyno comes back up, it wouldn't be retried immediately.  Hours later (depending
# on the max_run_time), Delayed::Job would consider the job released, and it would retry then.
# This means that on SIGTERM, we'll retry immediately.  On SIGKILL, we wait until `max_run_time` to
# try again.
#
# More reading:
# see https://github.com/collectiveidea/delayed_job#gory-details
# https://stackoverflow.com/questions/10438100/long-running-delayed-job-jobs-stay-locked-after-a-restart-on-heroku
Delayed::Worker.raise_signal_exceptions = true

