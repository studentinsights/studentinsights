class Absence < ApplicationRecord
  belongs_to :student

  # The database enforces more constraints, since adding them
  # as validations here impacts the performance of the import task.
  # With validations on associations, each call to check whether a record
  # is valid triggers additional queries to other tables to validate the foreign keys
  # In most cases, this in unnecessary, and when there is a violation the database
  # will enforce it.
  validates :student_id, presence: true
  validates :occurred_at, presence: true
end
