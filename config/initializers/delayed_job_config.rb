# This is overridden in specific jobs, but in general we don't want anything to run this long ever.
Delayed::Worker.max_run_time = 24.hours

# For the import job, we want it to run as one big job since the steps are sequential and dependent
# on running in a particular order.  The job overall is idempotent, but dependending on where it fails,
# the database may be in a somewhat inconsistent state (eg, only some records in a table are updated but
# others are still stale).  We tolerate that, and on failure re-run the entire job.
#
# The failure cases we've seen are running out of memory or a dyno restart from a config change, when
# Heroku sends a SIGERM and then SIGKILL.  In that case, we want want the job to be retried one more
# time and then be marked as "failed" and not retried anymore if it fails the second time.  This
# Delayed::Job record will stay in the database, and we'll see it in the import_records page.  Other
# monitoring will catch and notify us that the failure occurred.
#
# If we didn't set `raise_signal_exception`, when the task was killed the job would stay locked and
# when the worker dyno comes back up, it wouldn't be retried.  Hours laters (depending on the max_run_time),
# Delayed::Job would release the job and it would be retried then.  If the job kept failing (eg, if it 
# kept running out of memory), this would go on indefinitely for up to `max_attempts`, which with the 
# default settings means it would keep retrying for ~20 days.
#
# More reading:
# see https://github.com/collectiveidea/delayed_job#gory-details
# https://stackoverflow.com/questions/10438100/long-running-delayed-job-jobs-stay-locked-after-a-restart-on-heroku
Delayed::Worker.raise_signal_exceptions = true
Delayed::Worker.max_attempts = 2
Delayed::Worker.destroy_failed_jobs = false


