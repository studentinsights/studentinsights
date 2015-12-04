# This script defines environment variables about the AWS configuration that are
# used by other scripts.

# Credentials for authenticating with the AWS API
export KEY_NAME=hello-ec2

# For performing ssh operations on new boxes
export SUPERUSER=ec2-user
export SUPERUSER_PEM_FILE=~/.ssh/pem/ec2-user.pem

# DNS and domain name configuration
export DOMAIN_NAME=kevinrobinson-play.com
export HOSTED_ZONE_ID=Z376DTOR3KK86V

# Security group names, all tied to a specific availability zone at the moment.
# For now, create these manually and update here, but this could use
# some work to make it work across regions.
export SG_DEFAULT=sg-731c5e17
export SG_SSH_ACCESS=sg-90aee1f4
export SG_WEB_TRAFFIC=sg-5c0e4638
export SG_POSTGRES=sg-47b9f623

# AMI image for all nodes
export AMI_IMAGE_ID=ami-f0091d91