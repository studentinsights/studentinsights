# Submit a deploy to a production instance.
# usage: aws/rails/deploy.sh
INSTANCE_NAME=$1
POSTGRES_USER=postgres
# TODO(kr) password
POSTGRES_PASSWORD=

source aws/config.sh


echo "Deploying $INSTANCE_NAME..."
echo "Looking up Postgres IP..."
POSTGRES_IP_ADDRESS=$(aws/postgres/lookup_primary_ip.sh)
echo "Found: $POSTGRES_IP_ADDRESS"

echo "Copying deploy script..."
ssh $INSTANCE_NAME.$DOMAIN_NAME 'rm -rf ~/deploy; mkdir ~/deploy'
scp -r aws/rails/remote_deploy.sh $INSTANCE_NAME.$DOMAIN_NAME:~/deploy
ssh $INSTANCE_NAME.$DOMAIN_NAME chmod u+x deploy/remote_deploy.sh

echo "Submitting deploy command..."
DATABASE_URL=postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_IP_ADDRESS/homeroom_production
ssh $INSTANCE_NAME.$DOMAIN_NAME deploy/remote_deploy.sh $DATABASE_URL