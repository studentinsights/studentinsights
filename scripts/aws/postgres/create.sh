# Creates a Postgres instance.
# This involves tagging it with the name, creating a DNS entry for it, creating a new EBS volume
# and then attaching and mounting that EBS volume.
# Outputs the instance-id.
#
# example: postgres_create.sh INSTANCE_NAME
INSTANCE_NAME=$1

source aws/config.sh

echo "Creating Postgres instance $INSTANCE_NAME..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_IMAGE_ID \
  --instance-type t2.micro \
  --key-name $KEY_NAME \
  --security-group-ids $SG_DEFAULT $SG_SSH_ACCESS $SG_POSTGRES \
  --user-data file://$(pwd)/aws/postgres/provision_remote.sh \
  --output text \
  --query 'Instances[*].InstanceId')
echo "Created instance $INSTANCE_ID..."

echo "Waiting for instance to be 'pending'..."
aws/base/wait_for_instance_state.sh $INSTANCE_ID pending

echo "Creating $INSTANCE_NAME name tag..."
TAG_RESPONSE=$(aws ec2 create-tags --resources $INSTANCE_ID --tags Key=Name,Value=$INSTANCE_NAME)

echo "Waiting for instance to be 'running'..."
aws/base/wait_for_instance_state.sh $INSTANCE_ID running

echo "Adding DNS entry for $INSTANCE_NAME.$DOMAIN_NAME..."
aws/base/create_dns_record.sh $INSTANCE_ID $INSTANCE_NAME.$DOMAIN_NAME

echo "Creating a new EBS volume for data..."
VOLUME_ID=$(aws ec2 create-volume \
  --size 100 \
  --region us-west-2 \
  --availability-zone us-west-2b \
  --volume-type gp2 \
  --output text \
  --query 'VolumeId')
echo "Created volume $VOLUME_ID."

echo "Creating $INSTANCE_NAME-volume name tag for volume..."
TAG_RESPONSE=$(aws ec2 create-tags --resources $VOLUME_ID --tags Key=Name,Value=$INSTANCE_NAME-volume)

echo "Waiting for volume to be 'available'..."
aws/base/wait_for_volume_state.sh $VOLUME_ID available

echo "Attaching EBS volume $VOLUME_ID to instance $INSTANCE_ID..."
ATTACH_VOLUME_RESPONSE=$(aws ec2 attach-volume \
  --volume-id $VOLUME_ID \
  --instance-id $INSTANCE_ID \
  --device /dev/sdf)

echo "Waiting for volume to be 'in-use'..."
aws/base/wait_for_volume_state.sh $VOLUME_ID in-use

echo "Done creating Postgres instance."
echo $INSTANCE_ID
