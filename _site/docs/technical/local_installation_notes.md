# Local installation notes

## Yarn installation
Check out https://yarnpkg.com/en/docs/install or if you have Homebrew setup run:
```
brew install yarn
```

## Ruby installation
The project runs on a specific version of Ruby, specified in [.ruby-version](/.ruby-version).  You can check your Ruby version by running:

```
ruby -v
```

If you need to install a newer version of Ruby, we recommend using [rbenv](https://github.com/rbenv/rbenv#installation) and [ruby-build](https://github.com/rbenv/ruby-build#installation).

## Postgres installation on OSX

You can use Homebrew to install Postgres: `brew install postgres`

There's good information about how to use it at: `brew info postgres`

And you can start a Postgres server with `postgres -D /usr/local/var/postgres`

## Puma installation on El Capitan
On El Capitan, Puma expects headers for a version of OpenSSL that is no longer included in the OS.  This will cause `bundle install` to fail.  See https://github.com/puma/puma/issues/718 for more information.

You can workaround like this:

```
bundle config build.puma --with-opt-include=/usr/local/opt/openssl/include
bundle install
```

## Debian

On a Debian-like OS you may have to remove this line from the config of the development database (config/database.yml)
```
host: localhost
```
For an explanation, see [this Stackoverflow discussion](http://stackoverflow.com/questions/23375740/pgconnectionbad-fe-sendauth-no-password-supplied).

## Gentoo
On Gentoo, you may need to ensure that your username exists as a Postgres user.
