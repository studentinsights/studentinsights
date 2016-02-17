class RemoveAssessmentsNotBeingUsed < ActiveRecord::Migration
  def change
    Assessment.where(family: ['MAP', 'MELA-O', 'MEPA']).destroy_all
  end
end
