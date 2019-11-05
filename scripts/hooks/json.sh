#!/usr/bin/env bash
# These are the JSON files we expecte in source.  If there are more,
# safelist them here.
read -d '' EXPECTED_JSONS << EOF
app.json
data_flows_fixture.json
data_flows_for_other_importers.json
jest.json
manifest.json
package.json
EOF

# Search, excluding node_modules and coverage folders
FOUND_JSONS=$(find . -not -path './node_modules/*' -not -path './coverage/*' -type f -name "*.json" | xargs basename | sort)

# Diff, print any extra files 
DIFF=$(diff <(echo "$EXPECTED_JSONS") <(echo "$FOUND_JSONS"))
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  exit 0
else
  echo "Found unexpected .json files, aborting."
  echo "$DIFF" | tail -n +2
  echo "If these files should be checked in, add them to the safelist in json.sh."
  exit $EXIT_CODE
fi
