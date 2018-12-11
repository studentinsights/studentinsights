<style>
.Board {
  display: flex;
}
@media (max-width: 600px) {
  .Board {
    flex-direction: column;
  }
}
@media (min-width: 600px) {
  .Board {
    flex-direction: row;
  }
}


.Board-category {
  flex: 1;
}

.Board-title {
  font-size: 20px;
  margin-bottom: 10px;
}
@media (max-width: 600px) {
  .Board-title {
    margin-top: 20px;
  }
}


.Card {
  display: inline-block;
  background: #eee;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 10px;
}
@media (max-width: 600px) {
  .Card {
    width: 100%;
    min-height: 120px;
  }
}
@media (min-width: 600px) {
  .Card {
    width: 300px;
    height: 120px;
    overflow-y: scroll;
  }
}
</style>
<div class="Board">
  <div class="Board-category">
    <div class="Board-title">In progress now</div>
    <div class="Card"><b>Searching notes</b>: For finding past conversations, and for individual and group reflection</div>
    <div class="Card"><b>504 plans</b>: Export and import 504 plans and accommodations for Somerville</div>
    <div class="Card"><b>K5 reading</b>: Initial design collaborations on: looking up data points, groupings and interventions, MTSS, finding gaps</div>
    <div class="Card"><b>Discipline data</b>: Adding heatmap/scatterplot for day/time patterns</div>
    <div class="Card"><b>Redesigned logo</b>: For website and product itself</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Next up</div>
    <div class="Card"><b>Mark note as restricted</b>: Allow educators to catch each other if anything slips through</div>
    <div class="Card"><b>Warnings about sensitive topics in notes</b>: Prompt about educator-defined like for things like "51a" or "depression"</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Maybe next quarter</div>
    <div class="Card"><b>Student voice as support</b>: Collaborating to find ways to support more student voice as a support intervention (eg, MTSS in K8, redirect in HS).</div>
    <div class="Card"><b>Equity</b>: Potentially looking at class list assignments, grade 2/3 reading, PowerBI for achievement vs. SGP broken down by student characteristics.</div>
    <div class="Card"><b>Services and supports</b>: Possibly looking into tracking and showing the services that counselors and K8 SST/MTSS teams are connecting students with, and making that visible in Insights.</div>
    <div class="Card"><b>HS grades</b>: Grades and levels over time? Semi-automated import of quarterly grades or IPR codes?  Grade distributions?</div>
  </div>
</div>