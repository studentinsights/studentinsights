# typed: strict
class PasswordCheck < ApplicationRecord
  default_scope { order(id: :asc) }
  validates :json_encrypted, presence: true
end
