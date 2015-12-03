# Create a Rails instance, tags it with the name, create a DNS entry for it and outputs the instance id.
# example: rails_create.sh INSTANCE_NAME
INSTANCE_NAME=$1

source aws/config.sh


echo "Creating startup script for Postgres instance..."
STARTUP_SCRIPT_TMPFILE=$(mktemp)
cat > $STARTUP_SCRIPT_TMPFILE <<EOL
#!/bin/bash
yum update -y && yum install -y docker && service docker start
EOL
echo "Created temp file: $STARTUP_SCRIPT_TMPFILE"

echo "Creating Rails instance $INSTANCE_NAME..."
INSTANCE_ID=$(aws ec2 run-instances \
  --image-id $AMI_IMAGE_ID \
  --instance-type t2.micro \
  --key-name $KEY_NAME \
  --security-group-ids $SG_DEFAULT $SG_SSH_ACCESS $SG_WEB_TRAFFIC \
  --output text \
  --query 'Instances[*].InstanceId')
echo "Created $INSTANCE_ID..."

echo "Waiting for instance to be 'pending'..."
aws/base/wait_for_instance_state.sh $INSTANCE_ID pending

echo "Creating $INSTANCE_NAME name tag..."
TAG_RESPONSE=$(aws ec2 create-tags --resources $INSTANCE_ID --tags Key=Name,Value=$INSTANCE_NAME)

echo "Waiting for instance to be 'running'..."
aws/base/wait_for_instance_state.sh $INSTANCE_ID running

echo "Adding DNS entry for $INSTANCE_NAME.$DOMAIN_NAME..."
aws/base/create_dns_record.sh $INSTANCE_ID $INSTANCE_NAME.$DOMAIN_NAME

echo "Done creating Rails instance."
echo $INSTANCE_ID