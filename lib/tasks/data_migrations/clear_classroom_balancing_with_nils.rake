namespace :data_migration do
  desc "Clear older classroom balancing records after change to make schema stricter"
  task clear_classroom_balancing_with_nils: :environment do
    puts "before: ClassroomsForGrade.all.size: #{ClassroomsForGrade.all.size}"
    ClassroomsForGrade.all.each do |classrooms_for_grade|
      classrooms_for_grade.destroy! unless classrooms_for_grade.valid?
    end
    puts "after: ClassroomsForGrade.all.size: #{ClassroomsForGrade.all.size}"
  end
end
