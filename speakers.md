---
layout: page
title: Dorkbot Speakers
permalink: /speakers/
---
Dorkbot Manchester has hosted at least {{ site.tags.size }} speakers since 2007

{% for tag in site.tags %}
  {% assign t = tag | first %}
  {% assign posts = tag | last %}

<span id="{{ t }}"><b>{{ t }}</b> <a href="/speakers#{{ t }}">»</a> </span>
<ul>
{% for post in posts reversed %}
  {% if post.tags contains t %}
  <li>
    <a href="{{ post.url }}">#{{ post.title }}</a> on
    <span class="date">{{ post.date | date: "%B %-d, %Y"  }}</span>
  </li>
  {% endif %}
{% endfor %}
</ul>
{% endfor %}
