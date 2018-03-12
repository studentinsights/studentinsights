desc 'Check syntax and warnings for Ruby code'
task :lint do
  exec('find . -name "*.rb" -exec ruby -wc {} \; | grep -v "Syntax OK"')
end
