class Educator < ActiveRecord::Base
  devise :database_authenticatable, :rememberable, :trackable, :validatable, :timeoutable
end