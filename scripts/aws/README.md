# AWS deployment
This folder contains notes and scripts to:
 - create and provision AWS resources for running production containers
 - build Docker images for production
 - deploy production containers to EC2

These scripts are minimal and intended to be semi-automated rather than a one-button "turn on the cloud" experience.

The steps here are for setting up a domain and load balancer in front of a few Rails instances, with front-end assets served from CloudFront.  The Rails instances talk to a primary Postgres node that stores data on a separate EBS volume.

This does not cover some important features for a production deploy, most notably Postgres availability, backup or failover.


## Caveats
The script-based approach here doesn't have first-class ways to define roles, bundle containers together, or to do service discovery.  An example of this is how the Rails deploy script queries AWS for the primary Postgres IP in order to pass it as configuration when starting the Rails container.  Configuration management and service discovery are not things that are supported at all here; using something like Chef might be a better solution, or a cluster management system like Kubernetes that can take advantage of services being containerized and provides higher-level abstractions for grouping and linking containers.

Containers here are used mostly just a way to minimize the setup for development and production environments, and there's nothing packing multiple containers into an instance or doing any resource isolation.  There are other services like Amazon ECS that might be worth investigating if you're looking for something more managed.

Before deploying this for a public deployment, it would be good to do a security review with the IT team.  These articles might provide helpful background:

  - http://docs.aws.amazon.com/general/latest/gr/aws-access-keys-best-practices.html
  - http://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
  - http://docs.aws.amazon.com/AmazonVPC/latest/UserGuide/VPC_SecurityGroups.html

And https://d0.awsstatic.com/whitepapers/DDoS_White_Paper_June2015.pdf is a more thorough resource.

## Initial setup
You'll need to set up an AWS account, and you'll need to install the [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html).  You'll also need to choose a region for the deployment, and configure and authorize the AWS CLI.

This walkthrough assumes you've checked this repo out and are running scripts from it on OSX.

#### DNS, Route 53
In the AWS console, you can use Route 53 to purchase a domain name and set up DNS records to point to the load balancer.  The scripts for creating instances will also create DNS records for individual nodes (but not add them to the load balancer).

Start by just setting up a domain name, and note the `Hosted Zone ID` that was created for that domain.

### Security groups
In the EC2 console, you can create security groups that expose different ports to the internet.  For the deployment, you'll need groups that allow SSH access, web traffic (HTTP and HTTPS) and a group that allows Postgres traffic within the VPC.

Note: I was expecting to be able to define the Postgres security group as only allowing inbound traffic from the default security group for the VPC (or the Rails security group), but this didn't work as expected and prevented all traffic.  It also didn't work to define the group as only allowing inbound traffic from the VPC CIDR.  It did work to only allow the specific IP of a Rails instance, but that doesn't work well with multiple nodes or with adding or creating instances.  This is something that could use additional work as part of a production deployment.

See https://blogs.aws.amazon.com/security/blog/tag/Security+groups for more details about security groups.

#### config.sh
This defines configuration variables.  You should manually perform the setup above to collect the information for these variables (eg., creating security groups, adding the hosted zone in Route 53).  Then define those configuration values in `config.sh`.  Other scripts source this script for the environment variables it defines, and so this needs to be set up correctly for any scripts to work.

This file is not checked into source control, so an example file is included here:

  ```
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
  ```

The security group names should be fairly self-descriptive.  You should set these up manually in the AWS UI (or write a new script).


## Creating instances
#### Rails instances
First, let's create the Rails instances.  This will also tag them with names, create DNS A records for them, and install Docker.  It will not add them to the load balancer.

Our configuration here assumes it's using the domain `yourdomainname.com`.  If you're curious about the particular configuration of these nodes (eg., what instance type and AMI image, just check out the script).


```
$ time scripts/aws/rails/create.sh rails2001
Creating startup script for Rails instance...
Created temp file: /var/folders/7b/603kvhbd7bs0c9pc3wvx93s40000gn/T/tmp.W9sTsM8F
Creating Rails instance rails2001...
Created i-3f83e7e6...
Waiting for instance to be 'pending'...
done.
Creating rails2001 name tag...
Waiting for instance to be 'running'...
........done.
Adding DNS entry for rails2001.exampledomain.com...
Looking up IP address for i-3f83e7e6...
IP address is: 52.35.101.206
Creating temporary file for DNS configuration: /var/folders/7b/603kvhbd7bs0c9pc3wvx93s40000gn/T/tmp.QjuRumBC...
Creating an A record for rails2001.exampledomain.com to point to 52.35.101.206...
Submitted at 2015-12-04T15:21:11.958Z.
Done creating DNS record.
rails2001.exampledomain.com
Done creating Rails instance.
i-3f83e7e6

real  0m23.664s
user  0m5.664s
sys 0m1.049s
```

After that, we can create two more in the same way:
```
$ scripts/aws/rails/create.sh rails2002
...

$ scripts/aws/rails/create.sh rails2003
...
```

Note that these instances will be in the same region, and so updating these scripts to support multiple availability zones would be a good improvement.


#### Postgres instances
Next we'll do the same for the primary Postgres instance.

These instances have the same kind of creation script, but it also creates a separate EBS volume for mounting the database's data.  This means the data is stored separately from the EC2 instance running the process, so even if you (or Amazon) terminates the instance, you can start another instance that can mount the same data.  So the `scripts/aws/postgres/create.sh` script will create an instance, create an EBS volume, and attach the volume.  It also formats the new volume and mounts it at `/mnt/ebs-a` where the Postgres deploy scripts expect it to be.

So the output will have a few more steps:
```
$ time scripts/aws/postgres/create.sh postgres2001
Creating Postgres instance postgres2001...
Created instance i-2d8febf4...
Waiting for instance to be 'pending'...
done.
Creating postgres2001 name tag...
Waiting for instance to be 'running'...
............done.
Adding DNS entry for postgres2001.exampledomain.com...
Looking up IP address for i-2d8febf4...
IP address is: 52.11.213.208
Creating temporary file for DNS configuration: /var/folders/7b/603kvhbd7bs0c9pc3wvx93s40000gn/T/tmp.YVeMPO32...
Creating an A record for postgres2001.exampledomain.com to point to 52.11.213.208...
Submitted at 2015-12-04T15:31:05.336Z.
Done creating DNS record.
postgres2001.exampledomain.com
Checking availability zone of instance...
Found: us-west-2a
Creating a new EBS volume for data...
Created volume vol-2680ade7.
Creating postgres2001-volume name tag for volume...
Waiting for volume to be 'available'...
.done.
Attaching EBS volume vol-2680ade7 to instance i-2d8febf4...
Waiting for volume to be 'in-use'...
done.
Done creating Postgres instance.
i-2d8febf4

real  0m39.606s
user  0m9.966s
sys 0m1.821s
```

```


## Provisioning instances for administrative access
Awesome, so we created the instances and their DNS records.  Their setup scripts also provisioned them with other software like Docker that they'll need to function in production.  Now let's provision them so they have the proper users for accessing them through SSH.  This will be semi-automated, with scripts doing some work and walking you through the manual steps around enabling SSH access for users.  Also note that there may be a delay in running the initialization script when creating a new node (eg., it takes a minute or so to perform the "initializing" step and for the system log in the EC2 console to appear).

#### Set up user accounts
To setup user accounts for SSH access, we need to know which accounts we want to create, and the public SSH keys for those accounts.  We'll walk through doing this for one account, and you can repeat the same process if you have several admins or developers who you want to grant access.  In order to do this process, we need the root EC2 user credentials, and this assumes you have that PEM file locally (and specified in the `config.sh` file).

This is semi-automated since there are restrictions on running sudo commands without a TTY.  This could be automated further with a file mapping remote usernames to public SSH keys, and then copying those and setting them up when the instance is initially created.  That'd be a good improvement.

Keep in mind this is intended for a small number of admins and developers actively working on the system, so for now there's not any more sophisticated permissioning system.  Granting users ssh access gives them full access to the production instance.

```
$ scripts/aws/base/add_user.sh rails2001 krobinson ~/.ssh/krobinson-aws.pub
Copying public key file /Users/krobinson/.ssh/krobinson-aws.pub for krobinson to rails2001.exampledomain.com...
krobinson-aws.pub                                                                                                          100%  409     0.4KB/s   00:00
Copying remote script...
add_user_remote.sh                                                                                                         100%  747     0.7KB/s   00:00
Changing permissions...
scripts/aws/base/add_user.sh: line 38: scripts/aws/base/superuser_ssh: No such file or directory



Ready!
The permissions on the box don't allow running it remotely as a security precaution.
You'll have to run a few commands yourself.

Run this command on your local shell:
  $ ssh -o StrictHostKeyChecking=no -i /Users/krobinson/.ssh/pem/ec2-user.pem ec2-user@rails2001.exampledomain.com

And then run this command on the remote box:
  $ sudo /tmp/add_user_remote.sh krobinson && rm /tmp/add_user_remote.sh && exit

After that that user can ssh into the box with:
  $ ssh rails2001.exampledomain.com

Go ahead...
```

Following those instructions will add the user, set them up for SSH-key-only access, and add them to the `wheel` group so they can perform `sudo` commands.  You might also want to add them to the `docker` group so they can run Docker commands without `sudo`.

#### Password-less sudo
Afterward, you can also set up password-less sudo, since these users will have SSH-key-only access and won't have passwords.  This will apply to all users.  You can use a helper script to ssh in:

```
$ scripts/aws/base/superuser_ssh.sh rails2001
```

and then remotely run:

```
sudo visudo
```

and uncomment out the line:

```
## Same thing without a password
%wheel        ALL=(ALL)       NOPASSWD: ALL
```

This will let any user in `wheel` run commands as sudo, since they have SSH-key-only access and don't have passwords.



## Building production containers
There is a [Travis build](https://travis-ci.org/kevinrobinson/somerville-teacher-tool) set up for the project.  This will run tests for remote branches and pull requests, but also will build a production container on merges to master.  It also uploads asset artifacts to S3, so that the production container can point to them.

If you'd like to build a production container you can do this locally or on a separate EC2 instance.  You'll need Docker Hub and AWS credentials configured, and then can run the `scripts/aws/rails/builds.sh` script.  Keep in mind this will push to the Docker Hub repository, and that subsequent deploys will pull from there.



## Deploying production containers
If you're trying to deploy the service for the first time, you'll have to setup and seed the database first.  See the `First deploy!` section below.

First, in order to communicate with Docker Hub, you'll need to manually run `docker login` on the production instance to authenticate.  This authorization will be cached.  You'll also need to add the deploying user to the `docker` user group.

Second, run the local script `scripts/aws/rails/deploy.sh` to submit a deploy.  This script will query AWS for configuration information needed to perform the deploy, copy a script to the production instance that will perform the deploy, and then execute it.  The first pull may take a little while since it's pulling each layer of the container image, but these are immutable and cached, so subsequent pulls will be faster.

Third, check that the service is up!

Currently, the deploy works by pulling the production container image from Docker Hub, stopping the previous image, and then running the new image as a daemon.  This is less than ideal since it means there is some downtime during the deploy.  You can work around for now by doing a rolling deploy, but this is an area in need of improvement.

Also note that this is a minimal deploy step, and doesn't do anything sophisticated with setting up monitoring, alerting or even using upstart to ensure that the process restarts.

If you'd lke to perform deploys sequentially across multiple instances in a role (eg., all Rails instances), you can use a minimal script to do this.  The command is `$ scripts/aws/deploy.sh rails 2001 2002`, and deploys to rails instances numbered from 2001 to 2002 in serial.  See the script for more information.



## First deploy!
The sequence matters here, since we need to seed the production database, and we'd like to use Rails to do that.

  1. Deploy the master Postgres instance like normal, grab its IP address.
  2. Use the `scripts/aws/rails/seed.sh` script to run a production container on a Rails instance and seed the database.  This is currently setup to seed with demo data.
    ```
    # locally
    $ scp scripts/aws/rails/seed.sh rails2001.yourdomainname.com:~
    $ ssh rails2001.yourdomainname.com

    # (now remote)
    $ chmod u+x rails_seed.sh
    $ sudo ./rails_seed.sh <Postgres IP address>
    ```

  3. Deploy the Rails instances with `scripts/aws/rails/deploy.sh <Postgres IP address>`
  4. Try it!


## Maintenance
Older Docker images are not currently garbage collected, so the production boxes will likely fill up their disks relatively quickly if you're deploying frequently.  The `scripts/aws/base/clean_docker_remote.sh` can be run on a remote instance to free some disk space from older images and volumes.  You should look at this script more carefully before running this on a running production instance.  A cron job to identify images and volumes that are not used by the running container, and then safely cleans them out would be a good improvement.


## Destroying things
#### Instances
You can destroy an instance, which will terminate the EC2 instance and delete the DNS record added by the create script.  The script is not particularly smart about handling failure, and will not remove any related volumes that were attached and are unused afterward.

```
$ time scripts/aws/base/destroy.sh rails3001
Destroying rails3001...
Removing DNS record for rails3001...
Deleting rails3001.exampledomain.com...
Looking up instance-id for rails3001...
Instance id is: i-2494f0fd.
Looking up IP address for i-2494f0fd...
IP address is: 52.32.148.147
Creating temporary file for DNS configuration: /var/folders/7b/603kvhbd7bs0c9pc3wvx93s40000gn/T/tmp.XrPm8PTY...
Deleting A record for rails3001.exampledomain.com...
Submitted at 2015-12-04T15:44:03.225Z.
Done deleting DNS record for rails3001.exampledomain.com.
Terminating rails3001...
Looking up instance-id for rails3001...
Instance id is: i-2494f0fd.
Waiting for instance to be 'shutting-down'...
done.
Done destroying rails3001.

real  0m7.022s
user  0m2.332s
sys 0m0.446s
```


#### DNS records
You can individually delete DNS records with `scripts/aws/base/delete_dns_record.sh`:

```
$ scripts/base_delete_dns.sh rails2001
Deleting rails2001.yourdomainname...
Looking up instance-id for rails2001...
Instance id is: i-5946df9d.
Looking up IP address for i-5946df9d...
IP address is: 52.34.47.146
Creating temporary file for DNS configuration: /var/folders/7b/603kvhbd7bs0c9pc3wvx93s40000gn/T/tmp.nqMXXOXY...
Deleting A record for rails2001.yourdomainname...
Submitted at 2015-11-12T17:40:13.279Z.
Done deleting DNS record for rails2001.yourdomainname.
```

