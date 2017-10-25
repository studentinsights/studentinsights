# This essentially monkey patches `assets:precompile` so that the
# production Webpack build is run after `assets:precompile`.
# Monkey patching, from https://github.com/rails/webpacker/commit/d2a6537e6ab0896a9bf14b6eddc5c0961db2c802
Rake::Task['assets:precompile'].enhance do
  # Run yarn install first to force devDependencies to be installed, 
  # so that we can run the build process
  exec 'YARN_PRODUCTION=false yarn install --frozen-lockfile && yarn run build'
end
