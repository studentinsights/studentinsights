# Create a DNS A record pointing the FULL_DOMAIN_NAME to the IP address of INSTANCE_ID and
# outputs the full domain name.
#
# example: base_create_dns.sh foo.whatever.com 1.2.3.4
# see http://docs.aws.amazon.com/cli/latest/reference/route53/change-resource-record-sets.html
INSTANCE_ID=$1
FULL_DOMAIN_NAME=$2

source scripts/aws/config.sh


echo "Looking up IP address for $INSTANCE_ID..."
IP_ADDRESS=$(scripts/aws/base/ip_for_instance.sh $INSTANCE_ID)
echo "IP address is: $IP_ADDRESS"

TMPFILE=$(mktemp)
echo "Creating temporary file for DNS configuration: $TMPFILE..."
cat > $TMPFILE <<EOL
{
  "Comment": "Create DNS record set for $FULL_DOMAIN_NAME",
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "$FULL_DOMAIN_NAME",
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

echo "Creating an A record for $FULL_DOMAIN_NAME to point to $IP_ADDRESS..."
SUBMITTED_AT=$(aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch file://$TMPFILE \
  --output text \
  --query 'ChangeInfo.SubmittedAt')
echo "Submitted at $SUBMITTED_AT."

echo "Done creating DNS record."
echo $FULL_DOMAIN_NAME
