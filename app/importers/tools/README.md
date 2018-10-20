# Data Analysis

This folder contains code to help analyze flat data files (csvs) from
 Somerville Public Schools.  They're intended to be used from the command line.

Classes ending in `Table` are for analyzing raw data dumps from the Aspen/X2 Student Information System. These are useful for discovering data, understanding column/table structure, and checking to see why data might not be exporting properly.

Classes ending in `Export` are for analyzing the flat files exported nightly from Aspen X2. The nightly export scripts pull only a few selected columns from the database and do some basic cleaning and structuring of the data. These are useful for inspecting data before importing it into
 Student Insights.

