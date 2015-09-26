# server-based syntax
# ======================

load "#{Dir.pwd}/config/initializers/capistrano_server.rb"
server SERVER_NAME, roles: [:app], primary: true
