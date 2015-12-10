#!/bin/bash
# Remote script to provision a Postgres box, to be passed as --user-data when creating
# an instance.
echo "Installing docker..."
yum update -y && yum install -y docker

echo "Formatting and mounting EBS volume..."
MOUNT_POINT=/mnt/ebs-a
STORAGE_DEVICE=/dev/xvdf
POSTGRES_VOLUMES=$MOUNT_POINT/postgres_volumes

echo "Formatting $STORAGE_DEVICE..."
mkfs -t ext4 $STORAGE_DEVICE

echo "Mounting $STORAGE_DEVICE at $MOUNT_POINT..."
mkdir -p $MOUNT_POINT
cp /etc/fstab /etc/fstab.orig
echo "$STORAGE_DEVICE   $MOUNT_POINT  ext4    defaults,nofail 0   0" | tee -a /etc/fstab
mount -a
rm /etc/fstab.orig
echo "Done mounting $STORAGE_DEVICE at $MOUNT_POINT."

echo "Creating folder for Postgres volumes..."
mkdir -p $POSTGRES_VOLUMES

# This needs to be done after the volume is mounted.
# See: https://github.com/docker/docker/issues/5489#issuecomment-141438777
echo "Starting Docker daemon.."
service docker start

# In order to use the database in the Rails application, you'll also need to seed it from
# a production Rails container.  See scripts/aws/rails/seed.sh

echo "Done provisioning Postgres instance."