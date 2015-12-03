# Submit a deploy to a range of production instances.
# usage: scripts/deploy_all.sh rails 2001 2002
ROLE=$1
START_NUMBER=$2
END_NUMBER=$3

echo "Deploying all '$ROLE' instances..."
for NUMBER in `seq $START_NUMBER $END_NUMBER`;
  do echo; echo; aws/$ROLE/deploy.sh $ROLE$NUMBER;
done
echo "Done."