puts "Creating demo educators..."
Educator.destroy_all

Educator.create!([{
  email: "demo@example.com",
  password: "demo-password",
  admin: true
}, {
  email: "fake-fifth-grade@example.com",
  password: "demo-password",
  admin: false
}])
