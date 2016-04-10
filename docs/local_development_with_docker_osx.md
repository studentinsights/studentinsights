# Local development with Docker on OSX

You can run the project locally in Docker containers using docker-compose.  This [blog post](http://www.ybrikman.com/writing/2015/05/19/docker-osx-dev/) has great background motivation on why it's useful to use Docker for local development.

First, install VirtualBox and Docker Toolbox.

  - Install VirtualBox 5.0.8: https://www.virtualbox.org/wiki/Downloads
  - Install Docker Toolbox: http://docs.docker.com/mac/started/
  - Use docker-machine to create a new Docker host: `https://docs.docker.com/machine/get-started/`
  - For convenience, add the IP from `docker-machine ip default` as a line in `/etc/hosts` so you can work with `http://docker:3000` in your browser.
  - Install https://github.com/adlogix/docker-machine-nfs to use NFS for sharing files between the host machine and the VirtualBoxVM.  This is much faster than VirtualBox shared folders ([more info](https://github.com/codeforamerica/somerville-teacher-tool/pull/336#issuecomment-158441877)).

Run the project using `docker-compose`:
  - Rebuild all container images: `docker-compose build` (slow the first time)
  - Start bash in a Rails container to create the database and seed it:
    ```
    # Start a new Rails container from your laptop
    $ docker-compose run rails bash

    # Then run tasks within that container
    $ RAILS_ENV=development bundle exec rake db:setup db:seed:demo

    # And exit to discard the container when you're done.
    $ exit
    ```
  - Start all the services: `docker-compose up`
  - Open `http://docker:3000` in a browser!

### Running RSpec tests:
```
  # Start a new Rails container from your laptop
  $ docker-compose run rails bash

  # Seed the test database
  $ RAILS_ENV=test bundle exec rake db:setup

  # Run whatever tests you like
  $ RAILS_ENV=test bundle exec rspec
```

### Changes to the Gemfile
You'll need to rebuild the Docker image when the Gemfile changes.  Run `docker-compose build`.
