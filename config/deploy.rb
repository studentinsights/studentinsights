# config valid only for current version of Capistrano
lock '3.4.0'

set :application, 'SomervilleTeacherTool'
set :repo_url, 'https://github.com/codeforamerica/somerville-teacher-tool.git'
set :deploy_to, '/home/ubuntu/student_insights'
set :branch, 'master'
set :user, 'ubuntu'
set :ssh_options, { forward_agent: true }
set :linked_dirs, %w{log tmp/pids tmp/cache tmp/sockets vendor/bundle public/system}
set :rbenv_type, :user
set :rbenv_ruby, '2.1.6'
set :default_shell, '/bin/bash -l'
set :bundle_binstubs, nil

namespace :deploy do
  task :server do
    on roles(:app) do
      within current_path do
        # cd /home/ubuntu/student_insights/current &&
        execute :rails, "server"
      end
    end
  end
  after :publishing, :server
end
