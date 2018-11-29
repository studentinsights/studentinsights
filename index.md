{% include navbar.html %}

<section>
  <div class="Home-title">We work with educators to make student-centered data systems</div>
  <div class="Home-container">
    <div class="Home-image-container">
      <img src="img/teachers-working.jpg" alt="Teachers working together" class="Home-image" />
        <div class="Home-image-caption">
        Teachers working together
        </div>
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
  {% assign profile_title = 'Whole-child profile' %}
  {% capture profile_quote %}
    <p>"We want to understand young people as whole, not broken on the way in, and we want schooling and education to help keep young people whole as they continue to grow in a dynamic world."<a href="pals.html" style="display: block;">- Django Paris</a></p>
  {% endcapture %}
  {% capture profile_image %}
    <img src="img/profile-2.png" alt="A student profile example" style="border: 1px solid #eee;" />
      <div class="Home-image-caption">
        A student profile example
      </div>
  {% endcapture %}
  {% capture profile_button %}
    <a href="our-work.html#whole-child-profile" class="btn">More about profiles</a>
  {% endcapture %}
  {% include panel.html title=profile_title quote=profile_quote image=profile_image button=profile_button %}
</section>

<section>
  {% assign notes_title = 'Student-centered notes' %}
  {% capture notes_quote %}
    <p>"What we say shapes how adults think about and treat students, how students feel about themselves and their peers, and who gets which dollars, teachers, daily supports, and opportunities to learn."<a style="display: block;" href="pals.html">- Mica Pollock</a></p>
  {% endcapture %}
  {% capture notes_image %}
    <img src="img/feed-simple.png" alt="A note about Ryan Martinez in 5th grade by Maria Kelly in SST Meeting 4 minutes ago on 11/8: &quot;Ryan's really motivated by working with a younger student as a mentor. Set up a weekly system with LM so he read with as a way to build reading stamina.&quot;"/>
      <div class="Home-image-caption">
        A note created by a teacher about a student in a SST meeting.
      </div>
  {% endcapture %}
  {% capture notes_button %}
    <a href="our-work.html#student-centered-notes" class="btn">More about notes</a>
  {% endcapture %}
  {% include panel.html title=notes_title quote=notes_quote image=notes_image button=notes_button %}
</section>

<section>
  {% assign privacy_title = 'Trust, access, and privacy' %}
  {% capture privacy_quote %}
    <p>"Will students be able to examine their educational record and demand that errors are fixed?  How long will data be kept on students? Will it move with them from school to school?  What sorts of data will be shared and with whom?"<a style="display: block;" href="pals.html">- Audrey Waters</a></p>
  {% endcapture %}
  {% capture privacy_image %}
    <div>
      <img src="img/data.png" alt="Sensitive encrypted information of a student to secure the student's safety."/>
      <div class="Home-image-caption">
        Sensitive encrypted information of a student to secure the student's safety.
      </div>
    </div>
  {% endcapture %}
  {% capture privacy_button %}
    <a href="our-work.html#trust-access-and-privacy" class="btn">More about trust</a>
  {% endcapture %}
  {% include panel.html title=privacy_title quote=privacy_quote image=privacy_image button=privacy_button %}
</section>

<section style="margin-top: 60px; margin-bottom: 30px;">
  <h2>Additional projects</h2>
  <div class="TripleCard-row">
    {% include triple-card.html href="our-work.html#transitions" title="Transitions" line="In partnership with 8th and 9th grade counselor educators" image="img/transition-plain-form.png" %}
    {% include triple-card.html href="our-work.html#attendance-supports" title="Attendance supports" line="In partnership with assistance principals and family liaisons" image="img/absences.png" %}
    {% include triple-card.html href="our-work.html#class-lists" title="Class lists" line="In partnership with K-6 classroom teachers" image="img/class-list.png" %}
  </div>
  <div class="TripleCard-row">
    {% include triple-card.html href="our-work.html#grades-and-academic-supports" title="Grades and classroom supports" line="In partnership with 9th and 10th grade teachers" image="img/grades.png" %}
    {% include triple-card.html href="our-work.html#systems-of-supports" title="Triggers for Systems of Supports" line="In partnership with department heads and HS admin team" image="img/systems.png" %}
    <div class="TripleCard-card TripleCard-empty"></div>
  </div>
</section>

<a href="updates.html" class="btn">What are we working on right now?</a>

{% include footer.html %}