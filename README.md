Dorkbotmcr
===================

Kindly forked from Dorkbotlondon.

How to add Dorkbot events
--------------------------------------------------------
This website is generted by jekyll, and automatically builds when someone (maybe you!) pushes a new version to GitHub.

The entries for each Dorkbot live in the _posts directory, and are named as YEAR-MONTH-DAY-DORKBOTNUMBER.html.

At the top of each file you find a section of metadata, the only things you need to care about are:
* `number`. Which should be the Dorkbot number.
* `start`. The date + time this Dorkvent starts.
* `end`. Obvious.
* `where`. A reference to where the event took place - this needs to match up to an entry in _data/locations.yaml.
* `tags`. This should be a list of all the people who spoke at this dorkbot.
* Optionally, `title`. This is used for named events such as Dorkboat.

Below the --- line, you can put whatever you like! 

When you're done, `git add`, `git commit` and `git push` the changes .

Adding new locations
-----------------------------------------
Look in the `_data/locations.yaml` file, it should be somewhat obvious.


Development
-----------------------------------------
The site is rebuilt daily using GitHub Actions.

If you have Ruby, you can run `bundle install` and then this command to run the site locally:
```
bundle exec jekyll serve --incremental
```
