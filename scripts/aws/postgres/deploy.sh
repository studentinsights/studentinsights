# Submit a deploy to a production instance.
# expects: POSTGRES_USER and POSTGRES_PASSWORD
#
# usage: scripts/aws/postgres/deploy.sh postgres2002
INSTANCE_NAME=$1

source scripts/aws/config.sh


echo "Deploying $INSTANCE_NAME..."
echo "Copying deploy script..."
ssh $INSTANCE_NAME.$DOMAIN_NAME 'rm -rf ~/deploy; mkdir ~/deploy'
scp -r scripts/aws/postgres/remote_deploy.sh $INSTANCE_NAME.$DOMAIN_NAME:~/deploy
ssh $INSTANCE_NAME.$DOMAIN_NAME chmod u+x deploy/remote_deploy.sh

echo "Submitting deploy command..."
ssh $INSTANCE_NAME.$DOMAIN_NAME "deploy/remote_deploy.sh $POSTGRES_USER $POSTGRES_PASSWORD"

echo "Done deploy."