class LoginActivity < ApplicationRecord
  belongs_to :user,
             optional: true   # Optional because an attacker might try logging
                              # in with an email that doesn't belong to any educator.
                              # (Or more generously, because someone might typo their email.)
end
