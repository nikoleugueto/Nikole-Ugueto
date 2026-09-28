/**
 * Ceramic Pro Sarasota — Connected Operations.
 *
 * Two things live here, kept apart the same way the Castillo case keeps them:
 *
 *   1. REAL CONTEXT. Ceramic Pro Sarasota is an Elite Dealer in Sarasota, FL.
 *      The services, the brand (black, magenta, Titillium Web and Montserrat)
 *      and the problem — printed jobs, scattered records — come from Nikole's
 *      time there and from ceramicprosarasota.com.
 *
 *   2. A CONCEPT. The operations app is speculative. Every customer, vehicle,
 *      order number and amount in the prototype is sample data, and the app
 *      says so on screen. None of it is the shop's real pricing or clients.
 */

export const ceramic = {
  no: '01',
  kicker: 'Technology',
  logo: { src: '/assets/img/logo-ceramicpro.png', alt: 'Ceramic Pro Sarasota — Elite Dealer', w: 445, h: 156 },
  title: 'Connected Operations',
  lede: 'An operations app for automotive service teams, built around one simple idea:<br>every vehicle and every job should live in one shared record that the whole team can work from.',
  about: 'Ceramic Pro Sarasota is an Elite Dealer in Sarasota, Florida, protecting vehicles with ceramic coating, paint protection film, window tint, detailing and vinyl wrap.',
  role: { label: 'Role', value: 'Marketing Specialist · SaaS' },
  live: { href: 'https://ceramicprosarasota.com/', label: 'ceramicprosarasota.com' },

  /* --- 02 — the paper trail ---------------------------------------------- */
  problem: {
    no: '02',
    kicker: 'Problem',
    title: 'The work was great. Keeping track of it wasn’t.',
    body: 'Jobs were printed and handed to the people doing the work. Details lived across paper, spreadsheets, text messages, and invoices. Finding an order number, checking whether a car was ready, or confirming a payment meant searching across different places, and every handoff created another chance for something to get lost.',
    /* The same job, as five different records. Each one is a little out of
       step with the others, which is the point. */
    notes: [
      { n: 1, text: 'The same order, written three different ways.' },
      { n: 2, text: 'A status is only as current as the last person who updated it.' },
      { n: 3, text: 'Payment lives somewhere else entirely.' },
    ],
  },

  /* --- 03 — one record ---------------------------------------------------- */
  solution: {
    no: '03',
    kicker: 'Solution',
    title: 'One job. One record. Every team connected.',
    body: 'Instead of copying information from one place to the next, the whole team works from the same record, from the first call to the maintenance reminder a year later. When someone updates a job, everyone who needs to know sees it.',
    teams: [
      { id: 'sales',      label: 'Sales',      stages: ['lead', 'quote', 'maintenance'] },
      { id: 'production', label: 'Production', stages: ['job', 'production', 'qc'] },
      { id: 'finance',    label: 'Finance',    stages: ['invoice', 'payment'] },
      { id: 'management', label: 'Management', stages: ['pickup'] },
    ],
  },

  /* --- the product --------------------------------------------------------
     One job moves through nine stages. Each step says what the button does,
     what the record logs, what each team now sees, and what the customer is
     told. The iPad reads all of it from here. */
  product: {
    title: 'Follow one job.',
    body: 'Move Dana’s Model Y from the first call to pickup. Every tap updates the same record, so you can see how each team stays in sync.',

    hero: {
      id: 'CP-2418',
      customer: 'Dana Whitfield',
      phone: '(941) 555-0142',
      vehicle: '2024 Tesla Model Y',
      color: 'Pearl White',
      source: 'Quick Quote form',
      bay: 'Bay 2',
      services: [
        { name: 'Full front paint protection film', price: 1850 },
        { name: 'Ceramic Pro Gold coating', price: 1450 },
      ],
      deposit: 500,
      invoice: 'INV-1187',
      /* The physical key tag: permanent and reused job after job, so nobody
         writes an order number on it — the record links it instead. */
      key: { tag: 'Key 018', locker: 'Locker B', slot: 'Slot 12' },
      /* The four standard angles Production shoots before any work starts. */
      angles: ['Front', 'Driver side', 'Rear', 'Passenger side'],
    },

    stages: [
      { id: 'lead',        label: 'Lead',          team: 'sales',
        status: 'New lead', next: 'Log the call',
        say: 'A quote request came in overnight. Sales picks it up first thing.',
        log: { team: 'sales', text: 'Called Dana. She wants front PPF and a ceramic coating.' },
        customer: 'Thanks for reaching out, Dana! Your quote is on its way.',
        sees: { sales: 'Quote drafted from the call notes', management: 'New lead contacted within the hour' } },
      { id: 'quote',       label: 'Quote',         team: 'sales',
        status: 'Quote sent', next: 'Quote approved',
        say: 'Dana approves the quote from her phone. The job is created from it, so nothing is typed twice.',
        log: { team: 'sales', text: 'Quote approved. Job CP-2418 created from it.' },
        customer: 'You’re booked for Thursday at 8:00 AM. See you then!',
        sees: { production: 'New job on the schedule: Thursday, Bay 2', finance: '$500 deposit received' } },
      { id: 'job',         label: 'Job',           team: 'production',
        status: 'Scheduled', next: 'Check the car in',
        say: 'The car arrives. Its key goes into Locker B. At check-in, the team scans its QR tag to connect the key to the job, so no one has to write down a number.',
        log: { team: 'production', text: 'Checked in. Key 018 in Locker B, slot 12. Parked in Bay 2.' },
        customer: 'Your Model Y is checked in. We’ll text you when it’s ready.',
        sees: { production: 'Vehicle in Bay 2, key in Locker B · 12', sales: 'Customer told the car is checked in' } },
      { id: 'production',  label: 'Production',    team: 'production',
        status: 'In the bay', next: 'Mark the work complete',
        say: 'Before any work starts, Production photographs the car’s condition. Then the film and coating go on, visible to anyone who needs to know.',
        log: { team: 'production', text: 'Film installed and coating applied.' },
        customer: null,
        sees: { production: 'Ready for quality check', management: 'On schedule for Thursday' } },
      { id: 'qc',          label: 'Quality check', team: 'production',
        status: 'Quality check', next: 'Pass quality check',
        say: 'A second set of eyes checks the finish. Passing it creates the invoice from the approved quote.',
        log: { team: 'production', text: 'Quality check passed. Invoice INV-1187 created.' },
        customer: null,
        sees: { finance: 'Invoice INV-1187 ready to send', management: 'Job finished on time' } },
      { id: 'invoice',     label: 'Invoice',       team: 'finance',
        status: 'Invoice ready', next: 'Send the invoice',
        say: 'Finance sends the invoice that was already waiting for them, tied to the job it belongs to.',
        log: { team: 'finance', text: 'Invoice INV-1187 sent by text and email.' },
        customer: 'Your invoice is ready. Pay online or at pickup, whichever you prefer.',
        sees: { finance: '$2,800 balance due', sales: 'Invoice sent to Dana' } },
      { id: 'payment',     label: 'Payment',       team: 'finance',
        status: 'Awaiting payment', next: 'Record the payment',
        say: 'The balance is paid. The job, the invoice and the payment now agree with each other.',
        log: { team: 'finance', text: 'Balance of $2,800 paid. Receipt sent.' },
        customer: 'Payment received, thank you! Your Model Y is ready for pickup.',
        sees: { finance: 'Paid in full', production: 'Car can leave the bay' } },
      { id: 'pickup',      label: 'Pickup',        team: 'management',
        status: 'Ready for pickup', next: 'Hand over the keys',
        say: 'Dana picks up her car. The record stays open, because the relationship doesn’t end here.',
        log: { team: 'sales', text: 'Picked up. Coating check scheduled for next year.' },
        customer: 'Enjoy the new finish, Dana! We’ll remind you when it’s time for a check-up.',
        sees: { sales: 'Maintenance reminder set for 12 months', management: 'Job closed: on time and paid' } },
      { id: 'maintenance', label: 'Maintenance',   team: 'sales',
        status: 'Maintenance scheduled', next: null,
        say: 'A year from now, the same record reminds the team to invite Dana back for her coating check.',
        log: null, customer: null, sees: {} },
    ],

    /* The rest of the shop, so the dashboard and pipeline have a real day in them. */
    others: [
      { id: 'L-0932',  customer: 'New Instagram lead', vehicle: '2025 Range Rover Sport', service: 'PPF question',       stage: 'lead',        flag: 'Not contacted in 26 hours' },
      { id: 'L-0935',  customer: 'Rivera, J.',         vehicle: '2024 Rivian R1S',        service: 'Window tint',        stage: 'quote' },
      { id: 'CP-2415', customer: 'Marcus Lee',          vehicle: '2023 Porsche 911',       service: 'Full body PPF',      stage: 'production',  flag: 'May run past Friday' },
      { id: 'CP-2411', customer: 'Priya Shah',          vehicle: '2022 BMW X5',            service: 'Ceramic window tint', stage: 'invoice',    flag: 'Finished, not paid yet' },
      { id: 'CP-2409', customer: 'Tom Alvarez',         vehicle: '2021 Ford F-150',        service: 'Ceramic Pro Sport',  stage: 'pickup' },
      { id: 'CP-2402', customer: 'Grace Kim',           vehicle: '2023 Lexus RX',          service: 'Ceramic Pro Gold',   stage: 'maintenance', flag: 'Coating check due in 2 weeks' },
    ],

    /* The assistant's suggestions. Each one names the pattern it noticed and
       the reason, and nothing changes until a person acts on it. */
    insights: [
      { id: 'lead',  teams: ['sales', 'management'], tone: 'lead',
        title: 'A new lead hasn’t heard from us',
        body: 'The Range Rover inquiry from Instagram came in 26 hours ago and nobody has replied yet.',
        why: 'No call, text or email logged since it arrived.',
        act: 'Assign to Sales', done: 'Assigned to Sales. It’s at the top of their list.' },
      { id: 'late',  teams: ['production', 'management'], tone: 'late',
        title: 'Marcus’s 911 may run late',
        body: 'Full body film needs its cure time, which pushes the finish past Friday.',
        why: 'Scheduled work left is longer than the time before pickup.',
        act: 'Text Marcus now', done: 'Marcus has been told. Pickup moved to Monday.' },
      { id: 'unpaid', teams: ['finance', 'management'], tone: 'money',
        title: 'Finished jobs with open invoices',
        body: null, // written live, because Dana's job joins this list once it's invoiced
        why: 'The work is done but no payment is recorded.',
        act: 'Review invoices', done: null },
      { id: 'care',  teams: ['sales'], tone: 'care',
        title: 'A coating check is coming up',
        body: 'Grace Kim’s Lexus is due for its yearly coating check in two weeks.',
        why: 'Coatings last longest with a check-up once a year.',
        act: 'Send a reminder', done: 'Reminder sent to Grace with three times to choose from.' },
    ],

    teams: [
      { id: 'sales',      label: 'Sales' },
      { id: 'production', label: 'Production' },
      { id: 'finance',    label: 'Finance' },
      { id: 'management', label: 'Manager' },
    ],
  },

  /* --- evidence: Nikole's own photos from the shop -------------------------
     Real, not staged. Each one is paired with the part of the product it
     shaped, so the evidence reads as the reason for a decision. */
  evidence: {
    title: 'What the workflow looked like.',
    body: 'A few photos I took at the shop show how information moved between paper, spreadsheets, and physical keys. Each one helped shape a different part of the product.',
    shots: [
      { name: 'cps-ev-workorder', w: 1500, h: 2000, widths: [480, 800],
        alt: 'A printed work order on a clipboard, with the vehicle, dates and services filled in by hand and the pickup day highlighted.',
        caption: 'Every job started with a printed work order, filled in by hand. Updates still had to make their way across the workflow.',
        shaped: 'One shared job record' },
      { name: 'cps-ev-status', w: 1500, h: 2000, widths: [480, 800],
        alt: 'Two car keys with a handwritten tag, held in front of a spreadsheet marked “to be done” and “Done 10:30”.',
        caption: 'Progress lived in a spreadsheet while keys and paperwork moved separately through the shop.',
        shaped: 'Statuses everyone can see' },
      { name: 'cps-ev-bluey', w: 1500, h: 2000, widths: [480, 800],
        alt: 'A car key with a yellow tag that says “Blue Model Y” in marker, held beside a white car.',
        caption: 'Keys were identified with handwritten labels, making it harder to quickly connect the right key to the right vehicle and job.',
        shaped: 'The QR key tag' },
    ],
  },

  /* --- 04 — the thinking ---------------------------------------------------- */
  exploration: {
    no: '04',
    kicker: 'Exploration',
    title: 'Designed around how the work actually happens.',
    body: 'The experience was shaped around the moments where information was most likely to get lost across teams and systems, and as vehicles move through the shop.',
    points: [
      { title: 'Built for the shop floor',
        body: 'Designed for a team that moves between vehicles, bays, and customers, making each job easy to check and update wherever the work is happening, without being tied to a desk.' },
      { title: 'One record, not many',
        body: 'Connected sales, production, finance, and customer information to the same job so everyone works from one source instead of retyping or cross-checking details.' },
      { title: 'Status everyone understands',
        body: 'Created clear, shared statuses so anyone can see where a vehicle is in the process without having to ask or track someone down.' },
      { title: 'Keys stay connected',
        body: 'Linked each physical key to the job with a reusable QR tag, keeping the key, vehicle, locker, customer, and invoice connected without relying on handwritten numbers.' },
      { title: 'Document the work',
        body: 'Added a before-service photo step so the team can capture the vehicle’s condition and keep that record attached to the job from check-in through pickup.' },
    ],
  },

  /* --- 05 — impact. A projection, and labelled as one. ------------------- */
  testimonials: [
    {
      quote: 'Nikole was always curious about how we could improve the way the business worked. She asked thoughtful questions, explored how AI could help, and looked for ways to make our processes more efficient and connected.',
      name: 'Horacio Gomez-Beret',
      title: 'President, Ceramic Pro Sarasota',
    },
  ],

  impact: {
    no: '05',
    kicker: 'Impact',
    value: '65%',
    label: 'Less time spent tracking jobs',
    note: 'Projected impact based on workflow comparison.',
    results: [
      'Less time chasing information, with job details, updates, invoices, and vehicle information in one place.',
      'Fewer manual handoffs, as jobs move digitally instead of being passed between paper, spreadsheets, and messages.',
      'Fewer payment mix-ups, with invoices connected directly to the job and vehicle, from start to finish.',
      'Faster team coordination, with updates visible to everyone working on the same job.',
      'More visibility across the shop, making it easier to see what needs attention, what is delayed, and what is still unpaid.',
    ],
  },
};
