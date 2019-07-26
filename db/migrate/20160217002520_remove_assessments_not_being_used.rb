# typed: true
class RemoveAssessmentsNotBeingUsed < ActiveRecord::Migration[4.2]
  def change
    Assessment.where(family: ['MAP', 'MELA-O', 'MEPA']).destroy_all
  end
end
