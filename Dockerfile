FROM quay.io/aptible/ruby:ruby-2.0.0
 
# System prerequisites
RUN apt-get update && apt-get -y install libpq-dev nodejs
 
ADD . /opt/rails
WORKDIR /opt/rails
RUN bundle install --without development test
# RUN cp config/database.yml.example config/database.yml
RUN bundle exec rake assets:precompile
 
ENV PORT 3000
EXPOSE 3000
 
CMD bundle exec rails s -p $PORT