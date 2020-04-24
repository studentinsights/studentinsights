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
    <div class="Card"><b>Reading</b>: Reader profiles and problem-solving process</div>
    <div class="Card"><b>Security</b>: Multifactor authentication adoption</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Next up</div>
    <div class="Card"><b>Searching notes</b>: For finding past conversations, and for individual and group reflection</div>
    <div class="Card"><b>Mark note as restricted</b>: Allow educators to catch each other if anything slips through</div>
    <div class="Card"><b>Warnings about sensitive topics in notes</b>: Prompt about educator-defined like for things like "51a" or "depression"</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Maybe next quarter</div>
    <div class="Card"><b>K8 MTSS</b>: Including student voice in the process</div>
    <div class="Card"><b>Student voice as support</b>: Collaborating to find ways to support more student voice as a support intervention (eg, redirect in HS).</div>
    <div class="Card"><b>Services and supports</b>: Possibly looking into tracking and showing the services that counselors and K8 SST/MTSS teams are connecting students with, and making that visible in Insights.</div>
  </div>
</div>