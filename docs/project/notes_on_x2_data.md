# Notes

+ Somerville's Student Information System is [Aspen X2](http://www.follettlearning.com/technology/products/student-information-system).

+ X2 doesn't offer much in the way of visualization, doesn't integrate with STAR assessment results, and doesn't let staff enter interventions, which is why we are building out Student Insights on top of it.

+ This file aims to track what we learn about data in X2.

## Grade levels

+ Aspen X2 stores only the current grade level for each student. From John Breslin, Somerville schools IT department:

  > The grade levels stored are their current.  When I need to check for retentions, I compare current grade levels or YOGs to a prior year snapshot to determine retentions.  While there are some logs in the enrollment table, it’s tough to rely on that as some kids are bumped up and down during a year creating a wash in terms of retention.  There are very few retentions k-8.  If you based your axis on 12-(YOG – CURRENT SCHOOL YEAR END) and then prior years use 12-(CURRENT YOG – HISTORICAL SCHOOL YEAR END) that would give you grade levels for any given school year.  If you are able to store annual YOG snapshots, you could use those in your previous school year grade level calcs.

## Staff active/inactive status

+ Each school is responsible for maintaining its list of staff in X2.

+ If principals says that the staff list from X2 is out of date (inactive educators listed as active, for example), the school secretary can update the list in X2.
