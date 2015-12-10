# Queries for the public IP address of an instance by the instance name
INSTANCE_NAME=$1
INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=$INSTANCE_NAME" --output text --query 'Reservations[*].Instances[*].InstanceId')
echo $INSTANCE_ID
