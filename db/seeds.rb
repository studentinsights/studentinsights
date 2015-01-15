# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

Student.destroy_all
xls = Roo::Excelx.new "./spec/SampleData/SampleData.xlsx"
DataSet.merge_sheets_and_write(xls)