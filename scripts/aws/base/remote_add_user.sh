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

echo "Adding $USERNAME to wheel group..."
usermod -aG wheel $USERNAME

# The user won't have access to run Docker commands by default, but can sudo to run them.
# This grants them access to run docker commands without sudo.
echo "Adding $USERNAME to docker group..."
usermod -aG docker $USERNAME

echo "Done."