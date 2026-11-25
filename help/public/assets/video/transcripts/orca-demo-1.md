# Building Waymark with an AI agent

**00:00:01.600 – 00:00:10.880**

Thank you so much for the detail in the... In this issue and also in your pull request.

**00:00:11.920 – 00:00:18.655**

I have replied separately on the pull request, and what I thought would be interesting was to just kind of...

**00:00:19.695 – 00:00:28.655**

Now that I've decided that I would like to include your contribution in the plugin, I thought I would just kind of show

**00:00:29.890 – 00:00:33.490**

what that looks like currently. It has... It does change.

**00:00:33.490 – 00:00:43.330**

It has changed a lot since I first launched the plugin, and it's changed... It changes a lot now with AI tooling basically, like my...

**00:00:44.535 – 00:00:48.055**

Yeah. Things are crazy right now. So, I'm in a good way.

**00:00:48.775 – 00:00:56.135**

The tools is just really great right now and really accessible. So, I thought I'd just kinda show my workflow.

**00:00:56.135 – 00:01:01.690**

And I don't know how this is gonna go because I'm gonna step away while it's kinda working and I'm gonna be coming back.

**00:01:01.690 – 00:01:09.450**

So this might be cool or it might just... I might have to edit and so anyway, I'm gonna try and keep it simple.

**00:01:10.810 – 00:01:20.855**

So I started... Well, I'm gonna start this with a prompt to my agent, and that looks like this.

**00:01:22.215 – 00:01:29.060**

Basically, super simple, and I'm pointing it to your...

**00:01:30.020 – 00:01:37.460**

This most recent comment and also your pull request, and I'm basically just saying like, yep, let's do it.

**00:01:39.095 – 00:01:45.255**

And I'm also... I thought they should always display it because it's so helpful.

**00:01:45.255 – 00:01:50.135**

So it doesn't need to just be when there's no elevation, why not always display it and then

**00:01:51.175 – 00:01:55.270**

display both when available.

**00:01:56.550 – 00:01:58.550**

So this is my prompt.

**00:02:01.430 – 00:02:03.910**

I'm also going to

**00:02:06.505 – 00:02:11.785**

show it this screenshot that I made, and that's just

**00:02:16.985 – 00:02:25.650**

the before... This is like what the plugin currently does, and this is it in my development environment.

**00:02:26.210 – 00:02:31.890**

And this is kinda my local setup, and if you're interested in that,

**00:02:33.995 – 00:02:42.155**

the README, which is like the GitHub homepage or the README is in the root

**00:02:45.130 – 00:02:47.210**

of the plugin, README,

**00:02:49.690 – 00:02:54.730**

how to get set up locally. It uses docker, node, npm.

**00:02:54.730 – 00:02:59.805**

These are things that have their own install instructions.

**00:02:59.885 – 00:03:04.285**

So they can be a little bit tricky to set up depending on your

**00:03:05.325 – 00:03:09.805**

machine and operating system and stuff. But it is possible to get

**00:03:11.620 – 00:03:14.740**

the development environment set up, and that is basically,

**00:03:15.620 – 00:03:24.660**

it's like a containerised WordPress install that has the plugin... Has Waymark, activated, and it also has,

**00:03:26.875 – 00:03:30.555**

like, the demo data installed.

**00:03:32.075 – 00:03:37.195**

And what I've done here is created a new map, and then I uploaded the

**00:03:38.270 – 00:03:47.950**

GPX file that you provided, which is over here. This is... And then,

**00:03:51.325 – 00:03:53.405**

yeah, this is viewing it on the front end.

**00:03:53.405 – 00:04:01.245**

So this is showing the current state of the plugin as you kind of pointed out, like it's not very helpful, zero meters, completely agree.

**00:04:02.160 – 00:04:06.800**

So I'm also going to just...

**00:04:12.080 – 00:04:18.595**

Yeah. So I've written a good prompt and then I've got a screenshot cause a picture just kinda says a thousand words.

**00:04:19.155 – 00:04:25.315**

So we just wanna give the AI like as much context as possible.

**00:04:26.035 – 00:04:34.950**

And I should say that I've made Waymark basically AI ready. So it has

**00:04:35.830 – 00:04:43.990**

like... This is a good example of the AGENTS.md file is just kind of instructions for

**00:04:45.525 – 00:04:49.285**

agentic coding agents, how

**00:04:50.165 – 00:04:57.285**

it basically very detailed instructions of how to work with this code base and

**00:04:58.780 – 00:05:04.060**

to make it as easy as possible for people to use AI to kind of work with it.

**00:05:04.220 – 00:05:08.460**

And that's the goal at least. Okay.

**00:05:08.460 – 00:05:18.475**

So I'm just gonna go and open OpenCode, which I highly recommend.

**00:05:21.595 – 00:05:26.870**

So I've customised OpenCode for my purposes.

**00:05:31.910 – 00:05:38.470**

And I'm going to give it the task, which is that markdown file that I showed.

**00:05:39.375 – 00:05:45.215**

And then I'm also gonna do the screenshot, which is cascade.

**00:05:46.815 – 00:05:50.335**

Okay. That's it. I'm not gonna do anything else. I'm just gonna see what happens.

**00:06:23.141 – 00:06:28.261**

Okay. So I'm back and I've got some decisions to make.

**00:06:29.301 – 00:06:32.836**

I have just read this, so that sounds good.

**00:06:44.436 – 00:06:46.036**

Yeah. Sounds right.

**00:06:55.641 – 00:07:03.426**

Yeah. Compact is good. Yeah. Let's just kinda go with it. See... Let's just build it, see what happens.

**00:07:15.685 – 00:07:18.805**

Okay. So let's come up with a plan.

**00:07:26.300 – 00:07:26.860**

Okay.

**00:07:36.315 – 00:07:37.675**

K. So that...

**00:07:40.155 – 00:07:43.515**

I'm just kind of scanning this seeing, you know,

**00:07:48.110 – 00:07:50.030**

it's touching the right files.

**00:07:50.990 – 00:07:56.350**

It's kind of thinking about the right things.

**00:07:59.635 – 00:08:02.595**

It's breaking it up into steps.

**00:08:05.555 – 00:08:09.715**

So, yeah, it's kind of gonna wire it in.

**00:08:10.435 – 00:08:19.070**

It's gonna test... It's gonna add test coverage So we can prove...

**00:08:21.550 – 00:08:30.110**

We can like verify that it's working end to end, which actually means that we'll use Playwright to

**00:08:33.925 – 00:08:37.525**

control Chrome, Chromium.

**00:08:38.565 – 00:08:44.245**

So it will actually automate testing in the browser,

**00:08:45.925 – 00:08:50.510**

which the the plugin is already set up for that.

**00:08:50.510 – 00:08:58.430**

So it's natural that this is a UI change. So, yeah, we've... And to end to end tests

**00:08:59.230 – 00:09:02.945**

that is understandable that I would touch that.

**00:09:03.425 – 00:09:11.425**

And then I'm seeing documentation being synchronised, which is how the project kind of

**00:09:14.560 – 00:09:21.040**

stays... The documentation for the project stays in sync because it is

**00:09:22.000 – 00:09:31.115**

set up that way when ever change is made, it needs to be documented. This is kind of like I mentioned earlier about

**00:09:31.835 – 00:09:37.275**

how the project is set up for AI agents and that's kind of part of it.

**00:09:37.275 – 00:09:47.010**

There's this documentation skill that they need to use... That it uses in order to make sure that when it makes a change,

**00:09:47.010 – 00:09:51.010**

it gets documented and otherwise it just would be forgotten.

**00:09:51.010 – 00:09:54.850**

So it's, you know, it basically keeps track of changes automatically.

**00:09:58.205 – 00:09:59.805**

Alright. Yeah. Let's do it.

**00:10:17.494 – 00:10:22.009**

So just checking in on it every now and then.

**00:10:22.009 – 00:10:30.889**

I'm like going away and just coming back making sure it's not asking me something or,

**00:10:31.689 – 00:10:35.209**

permissions or something or

**00:10:37.404 – 00:10:44.524**

yeah, just checking in it. Sometimes it does just crash and things happen.

**00:10:44.524 – 00:10:50.999**

So I... Yeah, we just check-in and out basically.

**00:10:51.479 – 00:10:58.039**

So I'm seeing it's, you know, halfway through kind of doing its thing.

**00:10:58.759 – 00:11:05.424**

Yeah. So I'll be back later to see what's up.

**00:11:19.203 – 00:11:25.123**

So I guess while it's going, I could cross... I could maybe show

**00:11:26.268 – 00:11:30.188**

sub agents, see what's kinda going on under the hood.

**00:11:34.988 – 00:11:40.433**

K. Yeah. So currently, we've got a tester sub agent running.

**00:11:42.193 – 00:11:46.593**

So that means it's, like, made changes and it's verifying them, basically.

**00:11:47.153 – 00:11:55.128**

So this is the third sub agent for this session since we started.

**00:11:55.208 – 00:11:58.808**

So before that was build.

**00:12:00.408 – 00:12:09.743**

Yes. Okay. So the first sub agent was basically explored the code base, and it's... Was

**00:12:10.463 – 00:12:14.063**

told to do that by the primary agent.

**00:12:17.103 – 00:12:24.418**

And the primary agent delegated exploring the code base specifically for

**00:12:27.458 – 00:12:28.578**

this change.

**00:12:31.138 – 00:12:39.803**

And the sub agent, this is the explore sub agent, and that's job is to, yeah, go and...

**00:12:40.843 – 00:12:45.163**

I think it's actually an in... This one's a built-in OpenCode agent, I think.

**00:12:45.483 – 00:12:50.628**

And it's just good at, like, you know, figuring out code bases basically, and then

**00:12:51.428 – 00:12:57.828**

giving a report. And that report, it hands back to the primary agent.

**00:12:58.548 – 00:13:02.148**

And then the primary agent asked me a bunch of questions,

**00:13:03.323 – 00:13:13.803**

and then put together a plan, and then I told it to execute that plan, and then that's... It then delegated

**00:13:17.268 – 00:13:23.748**

executing that plan that is like making all the changes and writing tests and things like that.

**00:13:24.628 – 00:13:27.268**

You know, the file operations.

**00:13:31.083 – 00:13:33.803**

And this is like how it did it all.

**00:13:33.803 – 00:13:39.083**

And that, you know, those are diffs. So these are actual, like, showing what it changed.

**00:13:43.258 – 00:13:50.778**

And then, yeah, it kind of finishes with a bit of a summary. It hands that back to the primary agent, and then

**00:13:52.938 – 00:13:58.553**

it, the last thing to do was to test that the

**00:14:00.073 – 00:14:05.353**

changes we've made haven't broken anything.

**00:14:05.993 – 00:14:11.328**

The the tests... All the existing tests still pass, and then

**00:14:12.448 – 00:14:19.728**

there were additional tests. I don't know if it's got there yet, but I could look at that.

**00:14:19.728 – 00:14:25.043**

So, we'll go up... Back up to the primary view. So this is the primary agent,

**00:14:27.763 – 00:14:32.003**

and it's... Yeah. Testing. Yeah. It's still testing, basically.

**00:14:33.283 – 00:14:34.003**

Okay.

**00:14:34.963 – 00:14:36.883**

Just keep waiting and I'll be back.

**00:14:57.429 – 00:15:01.189**

Okay. So it's saying it's done.

**00:15:01.189 – 00:15:11.544**

So what I always like to do is tell it to show me in Chrome.

**00:15:12.664 – 00:15:16.104**

And that's something I've set up. So

**00:15:18.584 – 00:15:23.909**

whatever it's done, I wanna see it in a browser

**00:15:26.789 – 00:15:34.149**

in the dev setup, and then I can actually look at it and play with it.

**00:15:35.954 – 00:15:42.354**

I... Is more valuable to me than what it has to say.

**00:15:42.354 – 00:15:52.529**

And while it's opening in Chrome, I can kind of, you know, go back and see if it's flagged anything or...

**00:15:56.369 – 00:15:59.569**

K. Yeah. So there it's opened in Chrome.

**00:16:14.824 – 00:16:18.424**

So this is a different

**00:16:24.549 – 00:16:25.989**

where is this?

**00:16:29.269 – 00:16:29.769**

Okay.

**00:16:32.084 – 00:16:39.204**

This is a different track. So it looks like perhaps it's made like

**00:16:41.764 – 00:16:45.764**

test GPX file maybe.

**00:16:47.379 – 00:16:48.819**

Need to look.

**00:16:50.019 – 00:16:54.259**

If we go to changes, so this is my

**00:16:56.899 – 00:16:57.779**

Git client.

**00:17:05.694 – 00:17:10.014**

So these are all the edits it's made like in my editor.

**00:17:13.209 – 00:17:19.689**

It's obviously updated leaflet elevation as expected.

**00:17:23.289 – 00:17:25.609**

Pretty minimal changes,

**00:17:31.234 – 00:17:32.834**

which is good.

**00:17:36.594 – 00:17:38.514**

This is the tests.

**00:17:42.909 – 00:17:49.229**

So it's it's updated this Leaflet Elevation

**00:17:51.469 – 00:17:54.669**

plugin, which is part of the source.

**00:17:56.404 – 00:18:03.124**

And then those... The build process up... Puts those...

**00:18:04.244 – 00:18:12.419**

Builds the source into a single file, waymark.js, which is kind of

**00:18:13.699 – 00:18:16.659**

half human readable, half not.

**00:18:17.459 – 00:18:21.699**

And then that gets minified and compressed into

**00:18:23.014 – 00:18:33.894**

like, what the end user is delivered and what is executed on the browser to do this.

**00:18:35.759 – 00:18:38.399**

So I wonder if I just reload... Oh no.

**00:18:38.399 – 00:18:45.279**

Let's go back to Chrome because this is... It's kind of showing me this example.

**00:18:50.274 – 00:18:54.754**

So, yeah, it's taking a screenshot.

**00:18:54.834 – 00:19:01.794**

So it's verifying that it's actually looking at the right thing, which is good, but takes a second.

**00:19:06.529 – 00:19:08.689**

Now it's doing something else.

**00:19:11.569 – 00:19:15.649**

So I might just leave it for a sec.

**00:19:22.392 – 00:19:32.152**

So while it's finishing off the demo in Chrome, I may as well just go and kind of start looking at the actual changes.

**00:19:32.937 – 00:19:39.257**

So that is an issue. Okay. I'm just gonna let it finish because it keeps

**00:19:39.977 – 00:19:45.817**

switching back to the browser. So I'm just gonna let it... I'm not gonna try multitask. I'm just gonna let it finish.

**00:19:54.418 – 00:19:55.138**

Okay.

**00:19:57.138 – 00:20:04.418**

So it came back with two browser tabs, two different examples.

**00:20:12.783 – 00:20:19.423**

So that's flat elevation, and then this one is just the standard, demo, I think,

**00:20:20.328 – 00:20:26.568**

showing both the distance and elevation. I think that's really cool.

**00:20:30.568 – 00:20:32.808**

Yeah. That looks great.

**00:20:39.003 – 00:20:42.683**

Yeah. Very cool. Okay. So that looks good to me.

**00:20:43.803 – 00:20:48.683**

So now I'm gonna have to review the code.

**00:20:50.238 – 00:20:50.958**

So

**00:20:53.598 – 00:20:55.358**

already looked at that.

**00:20:56.718 – 00:21:00.638**

These are... I don't need to review these because they're compiled.

**00:21:07.273 – 00:21:13.673**

Mentioning the new tests. K. Yeah. New tests.

**00:21:16.108 – 00:21:19.308**

Generally, I don't micromanage the tests.

**00:21:22.108 – 00:21:25.388**

Okay. And then we've got some help.

**00:21:28.603 – 00:21:34.283**

Okay. Yeah. So this is actually get... This is making its way into the documentation.

**00:21:35.883 – 00:21:43.323**

This website, the settings page is gonna have... That mentions this new feature

**00:21:45.748 – 00:21:47.668**

twice, which is good.

**00:21:49.348 – 00:21:52.708**

It is documented in the developer documentation.

**00:21:55.348 – 00:21:57.508**

And like I said, I'm happy with the tests.

**00:21:58.543 – 00:22:03.023**

These files are, like, not go... Going to commit these. I'll delete them.

**00:22:04.703 – 00:22:14.078**

Okay. So I've now staged my... The... I've basically approved the changes using Git to

**00:22:15.198 – 00:22:21.998**

review the diffs, and then I'm staging whatever I'm happy with.

**00:22:22.638 – 00:22:28.573**

Now, I'm gonna get the primary agent to...

**00:22:35.693 – 00:22:41.708**

So this is my... I'm kinda giving it by telling it to ask open questions.

**00:22:41.708 – 00:22:49.868**

It's kind of nudging it to be like anything... It it will kind of flag anything that I might have missed because as you as you can probably

**00:22:49.868 – 00:22:55.813**

tell, like I'm not scrutinising it, like I do trust it.

**00:22:55.813 – 00:23:04.373**

And so, this is like a little way I I I like to be like before we before we commit these changes, know,

**00:23:04.373 – 00:23:11.898**

that it means they go into the code base. Just give it an opportunity to... And it will check.

**00:23:11.898 – 00:23:17.978**

It'll like double check things and anything unusual it might kind of ask me about.

**00:23:18.458 – 00:23:21.658**

Actually, that's a good point. It would probably ask me about these.

**00:23:21.658 – 00:23:26.923**

So it would be like, what do you wanna do with those? So what I wanna do is

**00:23:29.163 – 00:23:30.283**

delete them.

**00:23:32.843 – 00:23:40.518**

So now we've got a really clean working directory with just our edits.

**00:23:42.278 – 00:23:46.118**

It will do a double check, and then if it's happy, it will commit.

**00:23:46.118 – 00:23:51.443**

And that is a skill that my agent has that

**00:23:54.963 – 00:24:00.723**

tells it how I like my commit messages. And also the project is set up

**00:24:01.443 – 00:24:06.368**

to tell AI agents kind of conventions and things like that.

**00:24:06.368 – 00:24:10.768**

So it should put together a nice

**00:24:11.728 – 00:24:20.923**

readable commit message and title based on the changes that it's committing, and it can review those using git.

**00:24:20.923 – 00:24:27.643**

So it's kind of tied into git as well. So I'll just hit that, and then... Yeah.

**00:24:34.270 – 00:24:41.445**

Okay. So, yeah. It's basically created a nice git commit for me, and

**00:24:43.045 – 00:24:53.500**

I've set it up so it will only perform git operations when I explicitly asked to. I use git as like a way of,

**00:24:57.100 – 00:25:02.940**

yeah, controlling changes in the made by my me, agents, anyone.

**00:25:04.615 – 00:25:09.015**

And, I use it basically as like my undo button and

**00:25:11.335 – 00:25:13.575**

that's just my workflow. So

**00:25:15.495 – 00:25:23.030**

I'm very picky about what I let it do, and the commit is like a keyword that I've told it.

**00:25:23.030 – 00:25:32.765**

Like when I told you to commit, do this and only do commit as in only do a git write operation when I tell you to.

**00:25:33.805 – 00:25:37.085**

And then it did it and it created this commit.

**00:25:37.165 – 00:25:46.730**

These are the changes. This is the commit message and title that it created. So this is all... It did this for me.

**00:25:47.290 – 00:25:51.450**

It also referenced the issue.

**00:25:52.250 – 00:25:55.450**

So, I'm gonna

**00:25:56.505 – 00:26:05.145**

so I've... This has been committed to master, but I've not... So it's in this source,

**00:26:05.945 – 00:26:10.020**

and when I push it, it will go to

**00:26:13.300 – 00:26:17.620**

the public GitHub

**00:26:19.060 – 00:26:24.365**

master. It will... The change will appear there, but I've not yet

**00:26:25.565 – 00:26:33.805**

released it. So you can kind of think of that as I'm accepting this change

**00:26:34.605 – 00:26:40.790**

into the code base, into the project, and it's kind of pending release.

**00:26:42.710 – 00:26:51.190**

And I can create a release whenever I want, but I just wanted to kinda keep this easy and self contained.

**00:26:52.885 – 00:27:00.485**

So I've also noticed that the... My agent had a couple of like things it noticed because it's so good...

**00:27:00.485 – 00:27:05.445**

Often when it's doing things, it will notice other things

**00:27:05.445 – 00:27:11.190**

and often it will kind of bring those to my attention.

**00:27:11.830 – 00:27:17.270**

Right now, just wanna kind of finish up with this, and I don't want to get sidetracked.

**00:27:17.270 – 00:27:21.350**

So what I'm gonna do is just say

**00:27:38.320 – 00:27:46.160**

So that it will hopefully just kind of write us some notes in a new file,

**00:27:47.840 – 00:27:52.080**

and then I'm telling it to just kinda like I wanna... I'm done, like let's finish up.

**00:27:54.325 – 00:28:03.685**

And so, what I'll do now is I'm gonna push this new commit to

**00:28:04.725 – 00:28:08.800**

origin. This is master... This is like the project home.

**00:28:09.520 – 00:28:14.640**

So I'm pushing it, and then I can go and look.

**00:28:17.680 – 00:28:21.920**

This is it on GitHub. If I refresh this.

**00:28:24.395 – 00:28:29.995**

Yeah. So it's already received the commit,

**00:28:30.795 – 00:28:36.555**

and it's running automated checks and things like that. But

**00:28:39.500 – 00:28:43.100**

four minutes ago, the commit was

**00:28:45.980 – 00:28:48.860**

created, references

**00:28:52.065 – 00:28:53.185**

this issue,

**00:28:57.905 – 00:29:08.400**

but it is yet to be released. So it's basically just sitting there. It could be... So anyone now...

**00:29:11.360 – 00:29:12.160**

What's it doing?

**00:29:19.025 – 00:29:20.465**

I don't know what it's doing.

**00:29:26.705 – 00:29:36.810**

So it's not like getting deployed to the WordPress plugin directory.

**00:29:37.610 – 00:29:38.570**

It is

**00:29:41.850 – 00:29:44.890**

in the repository.

**00:29:45.850 – 00:29:52.515**

It's on GitHub. So anyone who now checks out the or forks the

**00:29:54.515 – 00:29:58.195**

master branch, which

**00:29:59.155 – 00:30:03.630**

I've just committed this to, would get the these changes.

**00:30:03.630 – 00:30:12.510**

So, you know, so if someone forged the GitHub repository tomorrow, they would see this new change,

**00:30:13.630 – 00:30:19.185**

but that's like the development... In development version.

**00:30:20.385 – 00:30:24.865**

Would... As a separate task later,

**00:30:25.025 – 00:30:34.190**

I would create a release and that would include this and potentially other changes. So it's kind of like scheduling.

**00:30:37.870 – 00:30:42.990**

Yeah. Multiple things can get, you know, added to a release.

**00:30:45.685 – 00:30:50.245**

Okay. So yes, session is wrapped up and it's created

**00:30:51.125 – 00:30:56.805**

a follow-up document, and that is, you know, it's just sitting there.

**00:30:56.805 – 00:31:04.030**

I've not that's just on my computer waiting for me for my next session and then...

**00:31:08.590 – 00:31:09.090**

Yeah.

**00:31:18.305 – 00:31:19.505**

Okay. I

**00:31:22.065 – 00:31:23.105**

hope that was helpful.
