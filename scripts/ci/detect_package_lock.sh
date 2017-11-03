if [ -f package-lock.json ]; then
    echo "package-lock.json found, that's bad because we're using Yarn!"
    exit 1;
else
    echo "No package-lock.json found, that's good because we're using Yarn!"
    exit 0;
fi
