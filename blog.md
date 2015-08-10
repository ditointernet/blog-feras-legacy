---
layout: default
title: Posts do Blog
---
<section class="page-content wc-container">
  <article class="post">
    <h1>Posts do Blog</h1>
    {% for post in site.posts %}
    	{% capture currentyear %}{{post.date | date: "%Y"}}{% endcapture %}
    	{% if currentyear != year %}
      	{% unless forloop.first %}</ul>{% endunless %}
      		<h5>{{ currentyear }}</h5>
      		<ul class="posts">
      		{% capture year %}{{currentyear}}{% endcapture %}
    		{% endif %}
      <li><a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a></li>
    {% endfor %}
  </article>
</section>