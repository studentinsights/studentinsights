{% include navbar.html %}

<section>
  <div class="Home-title">We work with educators to build student-centered data systems</div>
  <div class="Home-container">
    <div class="Home-image">
      <img src="img/teachers-working.jpg" style="border: 1px solid #eee;" />
    </div>
    <div class="Home-text">
      <div>
        <p>It’s people closest to the work, <b>within school communities</b> - teachers, young people, families - who will be able to build the next generation of school data systems that they need.</p>
        <p>We need more than just systems for counting numbers - we need ways to more deeply connect and tell our stories to tackle <b>what matters for our students.</b></p>
      </div>
      <div>
        <a href="about-us.html" class="btn">Learn more about us</a>
      </div>
    </div>
  </div>
</section>

## Our work
Our work on Student Insights built on the work that has [come before](about-us.html).  As we've worked, we found that three particular areas really resonated with the school community in Somerville.  Those have formed the core of Student Insights, that we've worked to deepen over time, and the base on which all other work is built.

<section>
  {% assign profile_title = 'Student-centered profile' %}
  {% capture profile_quote %}
    <p>"We want to understand young people as whole, not broken on the way in, and we want schooling and education to help keep young people whole as they continue to grow in a dynamic world."<a href="pals.html" style="display: block;">- Django Paris</a></p>
  {% endcapture %}
  {% capture profile_image %}
    <img src="img/profile.png" style="border: 1px solid #eee;" />
  {% endcapture %}
  {% capture profile_button %}
    <a href="profile.html" class="btn">More about profiles</a>
  {% endcapture %}
  {% include panel.html title=profile_title quote=profile_quote image=profile_image button=profile_button %}
</section>

<section>
  {% assign notes_title = 'Student-centered notes' %}
  {% capture notes_quote %}
    <p>"What we say shapes how adults think about and treat students, how students feel about themselves and their peers, and who gets which dollars, teachers, daily supports, and opportunities to learn."<a style="display: block;" href="pals.html">- Mica Pollock</a></p>
  {% endcapture %}
  {% capture notes_image %}
    <img src="img/feed-simple.png" />
  {% endcapture %}
  {% capture notes_button %}
    <a href="todo.html" class="btn">More about notes</a>
  {% endcapture %}
  {% include panel.html title=notes_title quote=notes_quote image=notes_image button=notes_button %}
</section>

<section>
  {% assign privacy_title = 'Privacy and access' %}
  {% capture privacy_quote %}
    <p>"Will students be able to examine their educational record and demand that errors are fixed?  How long will data be kept on students? Will it move with them from school to school?  What sorts of data will be shared and with whom?"<a style="display: block;" href="pals.html">- Audrey Waters</a></p>
  {% endcapture %}
  {% capture privacy_image %}
    <img src="img/data.png" />
  {% endcapture %}
  {% capture privacy_button %}
    <a href="todo.html" class="btn">More about privacy</a>
  {% endcapture %}
  {% include panel.html title=privacy_title quote=privacy_quote image=privacy_image button=privacy_button %}
</section>



<h6 class="Section-title">Transitions</h6>

<h6 class="Section-title">Attendance</h6>

<h6 class="Section-title">Class lists</h6>

<h6 class="Section-title">High school grades</h6>

<h6 class="Section-title">Systems of Supports</h6>

<a href="updates.html" class="btn">What are we working on right now?</a>

{% include footer.html %}