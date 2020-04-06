#!/bin/sh
SHARD=$1
TOTAL_SHARDS=$2
if [ -z "$SHARD" ]; then
  echo "Please describe how to shard the tests (eg, sharded_rspec.sh 1 4)"; exit 0;
  exit 1
fi
if [ -z "$TOTAL_SHARDS" ]; then
  echo "Please describe how to shard the tests (eg, sharded_rspec.sh 1 4)"; exit 0;
  exit 2
fi


PATTERN=_spec.rb
FILES=$(find -L spec | grep $PATTERN | sort | awk "(NR-1)%$TOTAL_SHARDS==$SHARD")
FILES_COUNT=$(echo $FILES | wc -w | xargs)


echo "START sharded_rspec..."
echo "  SHARD: $SHARD of $TOTAL_SHARDS"
echo "  FILES_COUNT: $FILES_COUNT files"
echo
echo "FILES:"
echo "$FILES"
echo 
bundle exec rspec $FILES