#!/bin/bash
# Remote script to provision a Postgres box, to be passed as --user-data when creating
# an instance.
echo "Installing docker..."
yum update -y && yum install -y docker && service docker start

echo "Formatting and mounting EBS volume..."
MOUNT_POINT=/mnt/ebs-a
STORAGE_DEVICE=/dev/xvdf

echo "Formatting $STORAGE_DEVICE..."
mkfs -t ext4 $STORAGE_DEVICE

echo "Mounting $STORAGE_DEVICE at $MOUNT_POINT..."
mkdir $MOUNT_POINT
cp /etc/fstab /etc/fstab.orig
echo "$STORAGE_DEVICE   $MOUNT_POINT  ext4    defaults,nofail 0   0" | tee -a /etc/fstab
mount -a
rm /etc/fstab.orig
echo "Done mounting $STORAGE_DEVICE at $MOUNT_POINT."

# In order to first stand up the database, you'll also need to seed it from a production Rails
# container.  See scripts/aws/rails/seed.sh