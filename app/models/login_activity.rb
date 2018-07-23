# This class was added in July 2018, login activity before that date wasn't tracked.

# A LoginActivity record can belong to an Educator record, using a polymorphic
# association. (See Educator#has_many :login_activities, as: :user.)

# However, because of the way Authtrail tracks users/educators, a LoginActivity
# will only be associated with an Educator if the LoginActivity was a success.
# See (https://github.com/ankane/authtrail/blob/master/lib/auth_trail/manager.rb#L15).

# If the attempted login is a failure, it will have user_id set to nil, but the
# email used in the attempt will be stored, so if the email matches with a valid
# Insights educator email we can use Educator.find_by_email(email).
class LoginActivity < ApplicationRecord
  belongs_to :user,
             polymorphic: true,
             optional: true
end
