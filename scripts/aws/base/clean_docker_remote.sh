# Remote script to clear disk space inside the Docker filesystem.
echo "Cleaning Docker filesystem..."

echo "Cleaning images more than a week old..."
docker rmi $(docker images --no-trunc  | egrep ' (weeks|months) ago' | tr -s ' ' | cut -d' ' -f3)

echo "Cleaning volumes..." # see http://blog.yohanliyanage.com/2015/05/docker-clean-up-after-yourself/
docker run -v /var/run/docker.sock:/var/run/docker.sock -v /var/lib/docker:/var/lib/docker --rm martin/docker-cleanup-volumes


echo "Done."