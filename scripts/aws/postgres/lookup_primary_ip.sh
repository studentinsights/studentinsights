# Get the IP of the primary Postgres server.
# Queries AWS for the instance with the tag `PostgresRole=primary`.
# This should be setup manually.
#
# No arguments.

source scripts/aws/config.sh

INSTANCE_ID=$(aws ec2 describe-instances --filters "Name=tag:PostgresRole,Values=primary" --output text --query 'Reservations[*].Instances[*].InstanceId')
IP_ADDRESS=$(scripts/aws/base/ip_for_instance.sh $INSTANCE_ID)
echo $IP_ADDRESS