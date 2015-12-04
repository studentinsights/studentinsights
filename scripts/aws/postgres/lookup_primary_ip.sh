# Get the IP of the primary Postgres server.
# No arguments

source scripts/aws/config.sh


INSTANCE_NAME=postgres2001

INSTANCE_ID=$(scripts/aws/base/instance_id_from_name.sh $INSTANCE_NAME)
IP_ADDRESS=$(scripts/aws/base/ip_for_instance.sh $INSTANCE_ID)
echo $IP_ADDRESS
