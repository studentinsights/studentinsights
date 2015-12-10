# Queries for the public IP address of an instance.
INSTANCE_ID=$1
IP_ADDRESS=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --output text --query 'Reservations[*].Instances[*].PublicIpAddress')
echo $IP_ADDRESS
