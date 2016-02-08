puts "Creating demo educators..."
Educator.destroy_all

Educator.create!([{
  email: "demo@example.com",
  password: "demo-password",
  local_id: '350',
  admin: true
}, {
  email: "fake-fifth-grade@example.com",
  password: "demo-password",
  local_id: '450',
  admin: false
}])
