# typed: strong
class LoggedSearch < ApplicationRecord
  validates :all_results_size, presence: true
  validates :clamped_query_json, presence: true
  validates :search_date, presence: true
end
