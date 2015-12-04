# Submit a deploy to a production instance.
# usage: scripts/rails_submit_deploy.sh
INSTANCE_NAME=$1

source scripts/aws/config.sh


echo "Deploying $INSTANCE_NAME..."
echo "Looking up Postgres IP..."
POSTGRES_IP_ADDRESS=$(scripts/aws/postgres/lookup_primary_ip.sh)
echo "Found: $POSTGRES_IP_ADDRESS"

echo "Copying deploy script..."
ssh $INSTANCE_NAME.$DOMAIN_NAME 'rm -rf ~/deploy; mkdir ~/deploy'
scp -r scripts/aws/rails/deploy_remote.sh $INSTANCE_NAME.$DOMAIN_NAME:~/deploy
ssh $INSTANCE_NAME.$DOMAIN_NAME chmod u+x deploy/deploy_remote.sh

echo "Submitting deploy command..."
ssh $INSTANCE_NAME.$DOMAIN_NAME deploy/deploy_remote.sh $POSTGRES_IP_ADDRESS
