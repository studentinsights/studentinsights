# Poll each second and block until INSTANCE_ID reaches TARGET_STATE.
# Will block indefinitely with no timeout.
INSTANCE_ID=$1
TARGET_STATE=$2

while CURRENT_STATE=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --output text --query 'Reservations[*].Instances[*].State.Name'); test "$CURRENT_STATE" != "$TARGET_STATE"; do
  sleep 1; echo -n '.'
done; echo 'done.'