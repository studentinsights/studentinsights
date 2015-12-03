# Terminate an EC2 instance, and remove its DNS record as well.
# Any additional EBS volumes are detached but are not affected (the root
# EBS volume will be terminated by default).  This isn't very clever 
# and is intended only for the happy path of "destroying an instance created
# by a create script."
#
# It doesn't block to wait until the instance is actually terminated, just
# that it starts shutting down.
#
# example: scripts/base_destroy.sh rails2005
INSTANCE_NAME=$1

source aws/config.sh

echo "Destroying $INSTANCE_NAME..."

echo "Removing DNS record for $INSTANCE_NAME..."
aws/base/delete_dns_record.sh $INSTANCE_NAME

echo "Terminating $INSTANCE_NAME..."
echo "Looking up instance-id for $INSTANCE_NAME..."
INSTANCE_ID=$(aws/base/instance_id_from_name.sh $INSTANCE_NAME)
echo "Instance id is: $INSTANCE_ID."
RESPONSE=$(aws ec2 terminate-instances --instance-ids $INSTANCE_ID)

# This will block indefinitely if it has already been terminated.
echo "Waiting for instance to be 'shutting-down'..."
aws/base/wait_for_instance_state.sh $INSTANCE_ID shutting-down

echo "Done destroying $INSTANCE_NAME."
