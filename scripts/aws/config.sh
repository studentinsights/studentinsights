# This script defines environment variables about the AWS configuration that are
# used by other scripts.

# Credentials for authenticating with the AWS API
export KEY_NAME=

# For performing ssh operations on new boxes
export SUPERUSER=
export SUPERUSER_PEM_FILE=

# DNS and domain name configuration
export DOMAIN_NAME=
export HOSTED_ZONE_ID=

# Security group names, all tied to a specific availability zone at the moment.
# For now, create these manually and update here, but this could use
# some work to make it work across regions.
export SG_DEFAULT=
export SG_SSH_ACCESS=
export SG_WEB_TRAFFIC=
export SG_POSTGRES=

# AMI image for all nodes
export AMI_IMAGE_ID=