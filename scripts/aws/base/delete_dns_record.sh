# Delete the DNS A record for a running INSTANCE_NAME.
# This won't work if the instance has been terminated previously
# (since the IP lookup by IP will fail).
#
# example: scripts/base_delete_dns.sh foo.whatever.com
# see http://docs.aws.amazon.com/cli/latest/reference/route53/change-resource-record-sets.html
INSTANCE_NAME=$1

source scripts/aws/config.sh


FULL_DOMAIN_NAME=$INSTANCE_NAME.$DOMAIN_NAME
echo "Deleting $FULL_DOMAIN_NAME..."

echo "Looking up instance-id for $INSTANCE_NAME..."
INSTANCE_ID=$(scripts/aws/base/instance_id_from_name.sh $INSTANCE_NAME)
echo "Instance id is: $INSTANCE_ID."

echo "Looking up IP address for $INSTANCE_ID..."
IP_ADDRESS=$(scripts/aws/base/ip_for_instance.sh $INSTANCE_ID)
echo "IP address is: $IP_ADDRESS"

# There's a period at the end of the name in the record set, not sure why that is but
# seems consistent everywhere.
TMPFILE=$(mktemp)
echo "Creating temporary file for DNS configuration: $TMPFILE..."
cat > $TMPFILE <<EOL
{
  "Comment": "Delete DNS A record for $FULL_DOMAIN_NAME",
  "Changes": [
    {
      "Action": "DELETE",
      "ResourceRecordSet": {
        "Name": "$FULL_DOMAIN_NAME.", 
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "$IP_ADDRESS"
          }
        ]
      }
    }
  ]
}
EOL

echo "Deleting A record for $FULL_DOMAIN_NAME..."
SUBMITTED_AT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://$TMPFILE \
  --output text \
  --query 'ChangeInfo.SubmittedAt')
echo "Submitted at $SUBMITTED_AT."

echo "Done deleting DNS record for $FULL_DOMAIN_NAME."
