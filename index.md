{% include navbar.html %}

<section>
  <div class="Home-title">We work with communities to make student-centered data systems</div>
  <div class="Home-container">
    <div class="Home-image-container">
        <a href="img/teachers-working.jpg" data-lightbox="teachers-working"> <img src="img/teachers-working.jpg" alt="Teachers working together" class="Home-image" /> </a>
    </div>
    <div class="Home-text">
      <div>
        <p>It’s people closest to the work, <b>within school communities</b> - teachers, young people, families - who will be able to build the next generation of school data systems that they need.</p>
        <p>We need more than just systems for counting numbers - we need ways to more deeply connect and tell our stories to tackle <b>what matters for our students.</b></p>
      </div>
      <div>
        <a href="about-us.html" class="btn Home-main-button">Learn more about us</a>
      </div>
    </div>
  </div>
</section>

<h2 style="margin-top: 30px;">How we work</h2>
Student Insights started in one school in Somerville in 2014, trying to integrate data from different vendors' data systems.  We found right away that the technical side of data interoperability was the easy part - finding ways to **grow and sustain student-centered practices** was much harder, but more meaningful.

As we started working with more schools, we also shifted the way we worked.  We focused less on the technology and more on the **last mile** of how our work could influence practice.  This led to new kinds of opportunities, grounded in the core values of: *seeing the whole-child*, *student-centered narratives* and embracing challenges around *trust, access and privacy*.



<section>
  {% assign profile_title = 'Seeing the whole child' %}
  {% assign profile_href = 'our-work.html#whole-child-profile' %}
  {% capture profile_quote %}
    <p>"We want to understand young people as whole, not broken on the way in, and we want schooling and education to help keep young people whole as they continue to grow in a dynamic world."<div>- Django Paris</div></p>
  {% endcapture %}
  {% capture profile_image %}
    <img src="img/profile-2.png" alt="A student profile example" style="border: 1px solid #eee;" />
      <div class="Home-image-caption">
        A student profile example
      </div>
  {% endcapture %}
  {% capture profile_button %}
    <a href="{{profile_href}}" class="btn">More about profiles</a>
  {% endcapture %}
  {% include panel.html title=profile_title quote=profile_quote image=profile_image button=profile_button href=profile_href %}
</section>

<section>
  {% assign notes_title = 'Student-centered narratives' %}
  {% assign notes_href = 'our-work.html#student-centered-narratives' %}
  {% capture notes_quote %}
    <p>"What we say shapes how adults think about and treat students, how students feel about themselves and their peers, and who gets which dollars, teachers, daily supports, and opportunities to learn."<div class="Home-quoted-person">- Mica Pollock</div></p>
  {% endcapture %}
  {% capture notes_image %}
    <img src="img/feed-simple.png" alt="A note about Ryan Martinez in 5th grade by Maria Kelly in SST Meeting 4 minutes ago on 11/8: &quot;Ryan's really motivated by working with a younger student as a mentor. Set up a weekly system with LM so he read with as a way to build reading stamina.&quot;"/>
      <div class="Home-image-caption">
        A note created by a teacher about a student in a SST meeting.
      </div>
  {% endcapture %}
  {% capture notes_button %}
    <a href="{{notes_href}}" class="btn">More about narratives</a>
  {% endcapture %}
  {% include panel.html title=notes_title quote=notes_quote image=notes_image button=notes_button href=notes_href %}
</section>

<section>
  {% assign privacy_title = 'Trust, access, and privacy' %}
  {% assign privacy_href = 'our-work.html#trust-access-and-privacy' %}
  {% capture privacy_quote %}
    <p>"Will students be able to examine their educational record and demand that errors are fixed?  How long will data be kept on students? Will it move with them from school to school?  What sorts of data will be shared and with whom?"<div class="Home-quoted-person">- Audrey Watters</div></p>
  {% endcapture %}
  {% capture privacy_image %}
    <div>
      <img src="img/data.png" alt="Sensitive encrypted information of a student to secure the student's safety."/>
      <div class="Home-image-caption">
        Encrypting student information as one part of data security.
      </div>
    </div>
  {% endcapture %}
  {% capture privacy_button %}
    <a href="{{privacy_href}}" class="btn">More about trust</a>
  {% endcapture %}
  {% include panel.html title=privacy_title quote=privacy_quote image=privacy_image button=privacy_button href=privacy_href %}
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
    {% include triple-card.html href="our-work.html#patterns-in-discipline" title="Patterns in discipline" line="In partnership with K8 assistant principals" image="img/discipline.png" %}
  </div>
</section>

<a href="updates.html" class="btn">What are we working on right now?</a>

{% include footer.html %}