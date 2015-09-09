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
  desc "Upload env.yml file"
  task :upload_yml do
    on roles(:app) do
      local_db_yml = StringIO.new(File.read("config/deploy/database.yml"))
      remote_db_yml_path = "#{current_path}/config/database.yml"
      execute :rm, remote_db_yml_path
      upload!(local_db_yml, remote_db_yml_path)
    end
  end
  task :initial do
    on roles(:app) do
      within current_path do
        execute :rails, "server"
      end
    end
  end
  after :publishing, :upload_yml
end
