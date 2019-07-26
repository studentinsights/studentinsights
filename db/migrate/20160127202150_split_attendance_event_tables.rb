# typed: true
class SplitAttendanceEventTables < ActiveRecord::Migration[4.2]
  class AttendanceEvent20160127 < ActiveRecord::Base
    self.table_name = :attendance_events
  end

  class StudentSchoolYear20160127 < ActiveRecord::Base
    self.table_name = :student_school_years
  end

  class Absence20160127 < ActiveRecord::Base
    self.table_name = :absences
  end

  class Tardy20160127 < ActiveRecord::Base
    self.table_name = :tardies
  end

  class NullModel
    def self.create!(*_); end
  end

  def up
    create_table :absences do |t|
      t.belongs_to :student_school_year, null: false
      t.datetime   :occurred_at,         null: false
      t.timestamps                       null: false
    end

    add_index :absences, [:student_school_year_id], name: "index_absences_on_student_school_year_id", using: :btree

    create_table :tardies do |t|
      t.belongs_to :student_school_year, null: false
      t.datetime   :occurred_at,         null: false
      t.timestamps                       null: false
    end

    add_index :tardies, [:student_school_year_id], name: "index_tardies_on_student_school_year_id", using: :btree

    AttendanceEvent20160127.find_each do |event|
      klass = Absence20160127 if event.absence
      klass = Tardy20160127 if event.tardy
      klass ||= NullModel
      klass.create!(
        student_school_year_id: event.student_school_year_id,
        occurred_at: event.event_date,
        created_at: event.created_at,
        updated_at: event.updated_at
      )
    end

    drop_table :attendance_events
  end

  def down
    create_table :attendance_events do |t|
      t.belongs_to :student
      t.belongs_to :school_year
      t.belongs_to :student_school_year
      t.boolean  :absence
      t.boolean  :tardy
      t.datetime :event_date
      t.timestamps
    end

    add_index "attendance_events", ["school_year_id"], name: "index_attendance_events_on_school_year_id", using: :btree
    add_index "attendance_events", ["student_id"], name: "index_attendance_events_on_student_id", using: :btree

    Tardy20160127.find_each do |event|
      year = StudentSchoolYear20160127.find(event.student_school_year_id)
      AttendanceEvent20160127.create!(
        student_id: year.student_id,
        school_year_id: year.school_year_id,
        student_school_year_id: event.student_school_year_id,
        event_date: event.occurred_at,
        created_at: event.created_at,
        updated_at: event.updated_at,
        tardy: true
      )
    end

    Absence20160127.find_each do |event|
      year = StudentSchoolYear20160127.find(event.student_school_year_id)
      AttendanceEvent20160127.create!(
        student_id: year.student_id,
        school_year_id: year.school_year_id,
        student_school_year_id: event.student_school_year_id,
        event_date: event.occurred_at,
        created_at: event.created_at,
        updated_at: event.updated_at,
        absence: true
      )
    end

    drop_table :absences
    drop_table :tardies
  end
end
