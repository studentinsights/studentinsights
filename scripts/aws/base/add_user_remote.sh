# Remote script to add a user and set up their SSH configuration for SSH-key-only acces.

USERNAME=$1

echo "Creating username $USERNAME..."
useradd -m $USERNAME

echo "Configuring authorized SSH keys..."
cd /home/$USERNAME
mkdir .ssh
chmod 700 .ssh
chown $USERNAME:$USERNAME .ssh
cat /tmp/$USERNAME.pub >> .ssh/authorized_keys
chmod 600 .ssh/authorized_keys
chown $USERNAME:$USERNAME .ssh/authorized_keys
rm -f /tmp/$USERNAME.pub

echo "Adding $USERNAME to wheel..."
usermod -aG wheel $USERNAME

# The user won't have access to run Docker commands by default, but can sudo to run them.
# If you'd like to change this, add the user to the docker group after Docker is installed on
# the instance (eg, usermod -a -G docker $USERNAME).

echo "Done."