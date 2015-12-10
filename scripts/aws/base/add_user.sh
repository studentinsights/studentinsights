# Add a user on a remote instance and set up SSH login for them.
# see http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/managing-users.html
# and http://aws.amazon.com/articles/1233/
#
# example: scripts/base_add_user.sh rails2001 krobinson ~/.ssh/krobinson.pub
INSTANCE_NAME=$1
USERNAME=$2
PUBLIC_KEY_FILE=$3

source scripts/aws/config.sh

function superuser_scp {
  SOURCE=$1
  TARGET=$2
  scp \
    -o StrictHostKeyChecking=no \
    -i $SUPERUSER_PEM_FILE \
    $SOURCE $SUPERUSER@$INSTANCE_NAME.$DOMAIN_NAME:$TARGET
}


function superuser_ssh {
  COMMAND=$@
  ssh \
    -o StrictHostKeyChecking=no \
    -i $SUPERUSER_PEM_FILE \
    $SUPERUSER@$INSTANCE_NAME.$DOMAIN_NAME \
    $COMMAND
}

echo "Copying public key file $PUBLIC_KEY_FILE for $USERNAME to $INSTANCE_NAME.$DOMAIN_NAME..."
superuser_scp $PUBLIC_KEY_FILE /tmp/$USERNAME.pub

echo "Copying remote script..."
superuser_scp scripts/aws/base/remote_add_user.sh /tmp/remote_add_user.sh

echo "Changing permissions..."
superuser_ssh chmod u+x /tmp/remote_add_user.sh

echo;echo;echo;
echo "Ready!"
echo "The permissions on the box don't allow running it remotely as a security precaution."
echo "You'll have to run a few commands yourself."
echo
echo "Run this command on your local shell:"
echo "  $ ssh -o StrictHostKeyChecking=no -i $SUPERUSER_PEM_FILE $SUPERUSER@$INSTANCE_NAME.$DOMAIN_NAME"
echo
echo "And then run this command on the remote box:"
echo "  $ sudo /tmp/remote_add_user.sh $USERNAME && rm /tmp/remote_add_user.sh"
echo 
echo "If you'd like to enable password-less sudo access, do it now."
echo "  $ sudo visudo # and make relevant edits"
echo 
echo "All done on the remote box!"
echo "  $ exit"
echo
echo "After that that user can ssh into the box with:"
echo "  $ ssh $INSTANCE_NAME.$DOMAIN_NAME"
echo
echo "Go ahead..."
echo
