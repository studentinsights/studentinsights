# Setting config on all sites in parallel

# Double quotes since the shell and yarn both are escaping.
# Add a name and a color for any new remotes.
echo "🚢  Running Heroku command..."
yarn concurrently \
  --names "demo,somerville,bedford,new-bedford" \
  -c "yellow.bold,blue.bold,magenta.bold,cyan.bold" \
  "'heroku $@ -r demo'" \
  "'heroku $@ -r somerville'" \
  "'heroku $@ -r bedford'" \
  "'heroku $@ -r new-bedford'"

echo "🚢  Done."