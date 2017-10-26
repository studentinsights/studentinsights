# This is based off https://github.com/docker-library/rails/blob/7926577517fb974f9de9ca1511162d6d5e000435/Dockerfile
# The Ruby version used here needs to match the Ruby version in the Gemfile.
FROM ruby:2.3.0

# see update.sh for why all "apt-get install"s have to stay as one long line
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev
RUN apt-get update && apt-get install -y nodejs --no-install-recommends

# see http://guides.rubyonrails.org/command_line.html#rails-dbconsole
RUN apt-get update && apt-get install -y postgresql-client --no-install-recommends

# For PDFs
RUN apt-get update && apt-get install -y wkhtmltopdf --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Yarn (get https transport and update the repository first)
RUN apt-get update && apt-get install -y apt-transport-https
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn

# copy just the Gemfile/Gemfile.lock/package.json/yarn.lock first, so that with regular
# code changes this layer doesn't get invalidated and docker can use a cached image that
# has already run those install processes
RUN mkdir /mnt/somerville-teacher-tool
COPY Gemfile /mnt/somerville-teacher-tool/Gemfile
COPY Gemfile.lock /mnt/somerville-teacher-tool/Gemfile.lock
COPY Gemfile.lock /mnt/somerville-teacher-tool/package.json
COPY Gemfile.lock /mnt/somerville-teacher-tool/yarn.lock
VOLUME /mnt/somerville-teacher-tool
WORKDIR /mnt/somerville-teacher-tool
RUN bundle install
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN yarn install

COPY . /mnt/somerville-teacher-tool

EXPOSE 3000
EXPOSE 4000
