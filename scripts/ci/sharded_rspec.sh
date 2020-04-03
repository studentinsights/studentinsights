#!/bin/sh
SLOT=$1
TOTAL_SLOTS=$2
if [ -z "$SLOT" ]; then
  echo "Please describe how to shard the tests (eg, parallel_rspec.sh 1 4)"; exit 0;
  exit 1
fi
if [ -z "$TOTAL_SLOTS" ]; then
  echo "Please describe how to shard the tests (eg, parallel_rspec.sh 1 4)"; exit 0;
  exit 2
fi


PATTERN=_spec.rb
FILES=$(find -L spec | grep $PATTERN | sort | awk "(NR-1)%$TOTAL_SLOTS==$SLOT")
FILES_COUNT=$(echo $FILES | wc -w | xargs)


echo "START parallel_rspec..."
echo "  SLOT: $SLOT of $TOTAL_SLOTS"
echo "  FILES_COUNT: $FILES_COUNT files"
echo
echo "FILES:"
echo "$FILES"
echo 
bundle exec rspec $FILES