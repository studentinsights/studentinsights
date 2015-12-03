# Poll each second and block until VOLUME_ID reaches TARGET_STATE.
# Will block indefinitely with no timeout.
VOLUME_ID=$1
TARGET_STATE=$2

while CURRENT_STATE=$(aws ec2 describe-volumes --volume-id $VOLUME_ID --output text --query 'Volumes[*].State'); test "$CURRENT_STATE" != "$TARGET_STATE"; do
  sleep 1; echo -n '.'
done; echo 'done.'
