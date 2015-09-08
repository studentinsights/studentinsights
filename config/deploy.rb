# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'SomervilleTeacherTool'
set :repo_url, 'https://github.com/codeforamerica/somerville-teacher-tool.git'
set :deploy_to, '/home/ubuntu/student_insights'
set :branch, 'master'
set :user, 'ubuntu'
set :ssh_options, { forward_agent: true }
set :linked_dirs, %w{bin log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}
set :rbenv_type, :user
set :rbenv_ruby, '2.1.6'
set :default_shell, '/bin/bash -l'

namespace :deploy do
  task :restart do
    on roles(:app) do
      RELEASE_PATH = 'apps/SomervilleTeacherTool/current'
      execute "cd '#{RELEASE_PATH}'; bundle exec rails server"
    end
  end
  after :publishing, :restart
end
