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
  </div>

  <div class="Board-category">
    <div class="Board-title">Next up</div>
  </div>

  <div class="Board-category">
    <div class="Board-title">Maybe next quarter</div>
  </div>
</div>