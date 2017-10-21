# This essentially monkey patches `assets:precompile` so that the
# production Webpack build is run after `assets:precompile`.
# Monkey patching, from https://github.com/rails/webpacker/commit/d2a6537e6ab0896a9bf14b6eddc5c0961db2c802
Rake::Task['assets:precompile'].enhance do
  exec 'yarn run build'
end
