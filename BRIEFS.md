# Capstone client briefs

> Simulated client briefs for the two capstones. The businesses are fictional composites, not real clients. Each brief is deliberately incomplete and contains contradictions the learner is expected to surface by asking, before writing code.

**Trainer key:** The ambiguities, withheld facts and rubric are NOT in this file. They live in the Firestore collection `briefKeys`, readable only by an allowlisted trainer.


---

## Module 12 — Capstone 1 — Coaching institute website

**Client:** Pragati Academy (fictional) · Mrs. S. Kulkarni, Director  
**Sector:** MHT-CET / JEE coaching, Kothrud, Pune  
**Time:** You have ~30 hours. This is a guided capstone: the brief is mostly complete.

### The email as it arrived

> **Subject:** Website for our classes
>
> Hello,
>
> We run a coaching class in Kothrud for 11th-12th science students, mainly MHT-CET and JEE. We have been running 9 years now. We have around 300 students each year and 11 teachers.
>
> Right now we have nothing online, only a WhatsApp number and some Instagram posts. Parents keep asking us to send details and we type the same thing again and again. We want a proper website so we can just send one link.
>
> Please make it simple and professional. Something that looks trustworthy for parents. Not too flashy. Our competitor has a website but honestly it looks very cheap, we don't want that.
>
> Main thing is parents should be able to enquire. We get most enquiries in April-May so it must be ready before that.
>
> Also we want it to come first on Google when someone searches coaching classes in Kothrud.
>
> Please tell me what you need from our side.
>
> Thanks,
>
> Mrs. Kulkarni
>

**Attached**

- A logo as a low-resolution JPEG with a white background (not transparent)
- 12 photos of classrooms and a few of students receiving prizes
- A Word document with course fees, batch timings and teacher names
- A results sheet listing 2024 and 2025 toppers with their percentile

**Must have**

- Five pages: Home, Courses, Faculty, Results, Contact
- Enquiry form capturing student name, parent name, phone, current class, course of interest, message
- Batch timings and fees presented clearly — this is the single most-asked question
- Click-to-call and WhatsApp links that work on a phone
- Google Map location for the Kothrud branch
- Works well on a phone — assume most parents open it on mobile

**Nice to have**

- Testimonials from parents
- A downloadable PDF prospectus
- Photo gallery

**Out of scope**

- Online fee payment
- Student login or portal
- Online test platform
- Blog

**Constraints**

- Static hosting on GitHub Pages — there is no server and no budget for one
- The client is non-technical and will not edit HTML
- Must be live before the April enquiry season

**Deliverables**

- Live site on GitHub Pages over HTTPS
- Public repository with meaningful commit history
- README explaining how to update fees, timings and faculty
- A written note to the client covering the form solution, the SEO expectation reset, and the consent question
- AI rejection log — what the assistant suggested that you overrode, and why

### Trainer key

The ambiguities, the facts withheld until asked, and the rubric are **not** in this
repository. They live in the Firestore collection `briefKeys`, readable only by an
allowlisted trainer, and are shown on the trainer dashboard.


---

## Module 19 — Capstone 2 — Trek operator website

**Client:** Sahyadri Trails (fictional) · Omkar D., co-founder  
**Sector:** Weekend trekking and outdoor trips, operating out of Baner, Pune  
**Time:** You have ~40 hours. This brief is deliberately thinner than Capstone 1. Scoping it is part of the assessment.

### The email as it arrived

> **Subject:** need a website, quite urgent
>
> Hi,
>
> We organise weekend treks in the Sahyadris — Rajmachi, Harishchandragad, Kalsubai, Andharban in monsoon, etc. Started 4 years back, now we run 6-10 treks a month and about 40-60 people join each weekend.
>
> Everything runs on Instagram and WhatsApp groups right now and it's become a mess. People DM us asking "what's coming up", we paste the same list, then they ask about price, difficulty, pickup point, what to carry. Then half of them drop off.
>
> We want a website where the upcoming treks are listed properly with dates and price and difficulty, and people can see details and send us an enquiry for a particular trek.
>
> The main thing — I need to be able to add a new trek myself every week. I am not technical at all. If I have to message you every time to add a trek this will not work for us.
>
> Almost everyone opens Instagram links on their phone so mobile is the priority. Also monsoon is our peak season so it should be ready well before June.
>
> One more thing, we want to take booking payments online eventually. Not now maybe, but keep it in mind.
>
> Budget is tight, we can't pay monthly for something expensive.
>
> Let me know.
>
> Omkar
>

**Attached**

- A WhatsApp export listing the next 8 treks in inconsistent formats (some with dates, some with "next Sat", prices written three different ways)
- About 60 phone photos, several rotated the wrong way, most over 4 MB
- A screenshot of a competitor's website they like

**Must have**

- A listing of upcoming treks with date, price, difficulty and duration
- A detail view per trek: itinerary, what to carry, pickup points, inclusions
- Enquiry route tied to a specific trek, so the enquiry says which trek it is about
- Filter or sort by difficulty or month
- Mobile-first — assume the majority arrive from an Instagram link on a phone
- The owner can add or edit a trek himself, without a developer and without editing HTML

**Nice to have**

- Photo gallery per trek
- "Past treks" archive for social proof
- WhatsApp share button per trek

**Out of scope**

- Online payment and booking (explicitly deferred — but the data model should not make it impossible later)
- User accounts
- Automated itinerary emails

**Constraints**

- Low running cost — free or near-free hosting
- Owner is non-technical
- Peak season is June; the site must be live before it

**Deliverables**

- Live site on HTTPS, on the client's own domain
- Public repository with a clean commit history and no secrets committed
- A written scoping note: the recommended approach for owner-editable content, with trade-offs and cost, and why the alternatives were rejected
- A maintenance guide written for a non-technical reader, covering how to add a trek
- Lighthouse report before and after image optimisation
- AI rejection log
- A 15-minute walkthrough: what you built, what AI did, what you overrode, what you would do next

### Trainer key

The ambiguities, the facts withheld until asked, and the rubric are **not** in this
repository. They live in the Firestore collection `briefKeys`, readable only by an
allowlisted trainer, and are shown on the trainer dashboard.
