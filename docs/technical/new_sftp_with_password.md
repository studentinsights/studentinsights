# New District SFTP Setup with Password

To set up an Insights instance, we need an SFTP server where data will sync nightly. The best option is to used private keys to secure the SFTP server, but some hosted Aspen/X2 instances are preconfigured to work with a username/password. We can work with that. Ideally password authentication is a temporary step and the site transitions over to public key auth before it reaches full deployment to a school or district.

#### Steps

1. Log onto AWS using the secure, two-factor-protected SFTP account
2. Create a new EC2 Ubuntu instance
3. Log into the new EC2 instance using the private key provided by AWS
4. Edit the config file

```
sudo vi /etc/ssh/sshd_config

# vim:

PasswordAuthentication yes
```

5. Become the root user: `sudo -s`
6. Add a new district: `adduser [[new_district_name]]`
7. Set a secure passphrase with letters, numbers, and symbols
8. The system will prompt you for info like Name, Office, and Phone Number, you can leave all that blank because it doesn't matter
9. Restart the ssh service: `service ssh restart`
10. Call up the new district on the phone and tell them their passphrase, never share the passphrase in plaintext over email


