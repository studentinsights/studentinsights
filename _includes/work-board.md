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
    <div class="Board-title">Priorities now</div>
    <div class="Card"><b>HS student voice</b>: Q2 self-reflection, updating "What I want my teachers to know about me" <a href="https://github.com/studentinsights/studentinsights/pull/2379">#2379</a> <a href="https://github.com/studentinsights/studentinsights/pull/2383">#2383</a> <a href="https://github.com/studentinsights/studentinsights/pull/2382">#2382</a> <a href="https://github.com/studentinsights/studentinsights/pull/2384">#2384</a></div>
    <div class="Card"><b>K5 reading</b>: Entering benchmark data, reviewing and revising groupings, visualization student growth over time  <a href="https://github.com/studentinsights/studentinsights/pull/2363">#2363</a> <a href="https://github.com/studentinsights/studentinsights/pull/2367">#2367</a> <a href="https://github.com/studentinsights/studentinsights/pull/2360">#2360</a> <a href="https://github.com/studentinsights/studentinsights/pull/2352">#2352</a></div>
    <div class="Card"><b>K8 MTSS</b>: Including student voice up front, simplifying the referral process, supporting problem solving over time</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Next up</div>
    <div class="Card"><b>SHS head coaches</b>: Grant access and add insights box about low grades</div>
    <div class="Card"><b>Searching notes</b>: For finding past conversations, and for individual and group reflection</div>
    <div class="Card"><b>Mark note as restricted</b>: Allow educators to catch each other if anything slips through</div>
    <div class="Card"><b>Warnings about sensitive topics in notes</b>: Prompt about educator-defined like for things like "51a" or "depression"</div>
    <div class="Card"><b>Notes word clouds</b>: Reflecting on how we talk about students by visualizing common words in your own notes</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Maybe next quarter</div>
    <div class="Card"><b>Student voice as support</b>: Collaborating to find ways to support more student voice as a support intervention (eg, redirect in HS).</div>
    <div class="Card"><b>Services and supports</b>: Possibly looking into tracking and showing the services that counselors and K8 SST/MTSS teams are connecting students with, and making that visible in Insights.</div>
    <div class="Card"><b>Equity</b>: Reviewing class list assignments.</div>
    <div class="Card"><b>HS grades</b>: Showing grades and levels over time</div>
  </div>
</div>