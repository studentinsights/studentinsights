# Local development with Docker

You can run the project locally, on Windows, Linux or OS X, in Docker containers using docker-compose.

## Docker background
### What does that mean?

Docker is virtualization software (it's a way for your computer to run other computers). Using Docker, you can define a whole computer in a text file, using a special syntax. That's called a Dockerfile -- if you're curious, [here's](/Dockerfile) the one for this project.

Once you define the computer, it can be shared on Github, just like you share code. The **docker** program lets you run it inside your computer, enter & exit at any time. The **docker-compose** program lets you hook two or more containers together (when one of these computers is running inside docker, it's called a "container").

### Why is it a good idea to use Docker?

This [blog post](http://www.ybrikman.com/writing/2015/05/19/docker-osx-dev/) has an in-depth explanation of how Docker saves time and headaches. It will probably be most relatable if you've had to do this the hard way a few times.

If you haven't had that experience, you'll have to take my word for it. Downloading a big project like ours from Github and running it often doesn't work the first time, nor the second through fifth, because the internals of your machine don't look exactly like the internals of ours. Dependencies will be missing and need to be installed, etc. Using Docker insulates you from all that.

### When is it a bad idea to use Docker?

If you already have a dev environment running to your satisfaction on your machine, there's no need to switch to Docker. If you're experienced at cloning Rails projects and getting them running the old-fashioned way, you can go either way. Docker is fun, but we just want to get a dev environment running; do whatever works for you.

## Docker setup
### Okay, how do I start using it?

Before you do any of this, clone the project from github by starting up Terminal and running `git clone https://github.com/studentinsights/studentinsights.git`. This will create a folder named `studentinsights` in the current directory.

#### Windows / OS X

Docker only runs on Linux. So, in order to run it on Windows or OS X, you need to start up a virtual machine that runs Linux. We use VirtualBox for this.

  - [Install VirtualBox 5.0.8](https://www.virtualbox.org/wiki/Downloads)

You don't need to do anything with it right now.

  - Install Docker Toolbox: [OS X](http://docs.docker.com/mac/started/), [Windows](http://docs.docker.com/windows/started/)

This is a detailed tutorial. Everything after completing "Install Docker on OS X" is fun (and useful, but unnecessary if you just want to get the project running already. So feel free to stop there.

  - [Use docker-machine to create a new Docker host](https://docs.docker.com/machine/get-started/)

**docker-machine** is the command line program, thoughtfully included by the Docker folks, which uses VirtualBox to set up a Linux machine and run the **docker** program on it.

Again, everything in this tutorial after "Create a machine" is fun but unnecessary.

Normally, when you run a dev copy of the project on your machine, you visit it by visiting "http://localhost" in your browser. (This is an alias for a certain IP). That won't work here, because the project is running inside VirtualBox, which has its own IP. You can get this IP by running `docker-machine ip default` (where "default" is the name of the VirtualBox machine) in your terminal.

Your computer has a special file named "/etc/hosts" which maps names to IP addresses. (You can edit it by typing `nano /etc/hosts` in your terminal, or any other way you know how to edit system files). We recommend adding the IP from `docker-machine ip default` as a line in this file (the format is **<IP> <name>**) so you can work with "http://docker:3000" in your browser (instead of typing that IP directly).

So, we have three command-line programs (**docker**, **docker-compose** and **docker-machine**).

#### Linux

If you're already on Linux, you don't need to worry about **docker-machine**. Just install using your package manager and you're good to go. Here are instructions specific to [Ubuntu](https://docs.docker.com/engine/installation/linux/ubuntulinux/), but you can also pick from a number of distros on the sidebar.

The docker daemon needs root permissions, so by default you'll have to use **sudo** for all your docker commands. You can avoid this by adding yourself to the **docker** group.

`$ sudo groupadd docker`

`$ sudo usermod -aG docker yourname`

## Student Insights setup
### Okay, now what?

  - Navigate to where you cloned the project (so you should be at the root of the project, in the folder named "studentinsights").
  - Run the project using **docker-compose**:
    - Rebuild all container images: `docker-compose build` (this will take minutes the first time)
    - Start bash in a temporary Rails container to create the database and seed it:
       - Start a new Rails container from your laptop: `docker-compose run studentinsights bash`. This will give you a new command line, something like "root@8595f0db21aa:/mnt/somerville-teacher-tool". That means you're inside the container.
       - Set up the database and seed it with demo data: `RAILS_ENV=development bundle exec rake db:setup db:seed`
       - Get back to your terminal (and discard the container): `exit` or Control+D.
    - Start all the services: `docker-compose up`. (This will occupy your terminal. To stop it and bring the server down, press Control+C).
    - Open [http://docker:3000](http://docker:3000) (or [http://localhost:3000](http://localhost:3000) on Linux) in a browser! Log in using *demo@example.com* and *demo-password*.

Okay, now make sure you can get at what you just did. Bookmark "http://docker:3000" and put VirtualBox in your Dock so you can access it later.

### Getting inside your Docker container:
We just created a temporary studentinsights container to access the database with, but you can also get inside a running container. Run `docker ps` to see all the running containers you have. An ID will be displayed next to the container's name. Run `docker exec -it <ID> bash` to get inside your container. From here you can run rake tasks or whatever else you need.

(This means: run command **bash**, in **i**nteractive mode, attached to (this) **t**erminal, inside container **<ID>**.

### Run a Rails console
You can get a **psql** shell (which lets you run SQL against the database) by running

```
docker exec -it studentinsights_studentinsights_1 bundle exec rails c
```

### Run Jest tests
You can get a **psql** shell (which lets you run SQL against the database) by running

```
docker-compose run studentinsights yarn test
```


This is executing, in the Rails container, the `bundle exec rails c` command which gives you a Rails console, where you can run Ruby code, query models, etc.

### Troubleshooting:
**Can't connect to Postgres:** The Postgres container image sets the username as `postgres`, and our `docker-compose.yaml` calls that container "postgres".  So you may need to modify the Rails `database.yml` to match.

**Changes to the Gemfile:** The Gemfile lists all of the Ruby dependencies for the project. When it changes, you need to run `docker-compose build` again to install the new dependencies. If you're experiencing problems after pulling from master, it might be because the Gemfile changed.

**docker-compose up not working:** Try restarting the Linux machine by typing `docker-machine restart`. If that is taking forever, check VirtualBox to see if the machine is running. If it's not, shift-click on the "Start" arrow.

**Illegal Instruction: 4 when running docker-compose**: This is a [known issue](https://github.com/docker/compose/issues/1885) with older Macs. The fix suggested in the link is to run `pip install docker-compose` and try it again.

**A server is already running. Check /mnt/somerville-teacher-tool/tmp/pids/server.pid.**: Sometimes **docker-compose** doesn't clean up after itself when it shuts down. There's a file at "tmp/pids/server.pid" -- delete it (from within the studentinsights folder, you can run `rm tmp/pids/server.pid`) and try again.

**Loading pages is really slow!**: This is an unfortunate side effect of Docker -- going through the layer of virtualization to get CSS and image files is slow. Note that this is only a problem for us, not for users. You can try [https://github.com/adlogix/docker-machine-nfs](https://github.com/adlogix/docker-machine-nfs) to use NFS for sharing files between the host machine and the VirtualBoxVM. It may solve the problem, but I haven't been able to get it to work. ([Kevin looked into this](https://github.com/codeforamerica/somerville-teacher-tool/pull/336#issuecomment-158441877)).

**ERROR: Service failed to build: failed to register layer: ...**: Docker on your VirtualBox machine is in a bad state for some reason. Run `docker-machine rm default` and `docker-machine create --driver virtualbox default` to set up a new one.

**bash: gem: command not found** when running `docker-compose up` for the first time: We had this happen once with the gem **wkhtmltopdf-binary**, though it may have been temporary. Open an issue letting us know the problem. Then you can comment out the relevant line in your Gemfile.

### Running RSpec tests:
```
  # Start a new Rails container from your laptop
  $ docker-compose run studentinsights bash

  # Seed the test database
  $ RAILS_ENV=test bundle exec rake db:setup

  # Run whatever tests you like
  $ RAILS_ENV=test bundle exec rspec
```

### Running Jest tests:
```
  $ docker-compose run studentinsights yarn test
```

### Feedback:
If you have any difficulties with or ideas to improve this tutorial, make an issue, let us know on [Slack](https://cfb-public.slack.com/messages/somerville-schools/), or email me at really.eli@gmail.com!
