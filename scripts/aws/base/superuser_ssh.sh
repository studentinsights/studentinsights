# SSH into a remote instance using the EC2 superuser credentials defined in config.sh
INSTANCE_NAME=$1
source scripts/aws/config.sh

ssh -o StrictHostKeyChecking=no -i $SUPERUSER_PEM_FILE $SUPERUSER@$INSTANCE_NAME.$DOMAIN_NAME