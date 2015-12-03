# Remote script to run the production Postgres image.

# Starts the database as a daemon, and mounts data on the mount point for the EBS volume.
docker run \
  -p 5432:5432 \
  -v /mnt/ebs-a/postgres_data:/var/lib/postgresql/data \
  -d \
  postgres
