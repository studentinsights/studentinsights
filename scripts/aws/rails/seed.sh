# Seeds the production database from a provisioned Rails instance.
# usage: scripts/rails_seed.sh POSTGRES_IP_ADDRESS
POSTGRES_IP_ADDRESS=$1

# Run the Rails command to see the database
# Note that this is currently configured to seed with demo data.
docker run \
  -e 'RAILS_ENV=production' \
  -e "DATABASE_URL=postgresql://postgres@$POSTGRES_IP_ADDRESS/homeroom_production" \
  kevinrobinson/somerville-teacher-tool:production_rails \
  bundle exec rake db:setup db:seed:demo
