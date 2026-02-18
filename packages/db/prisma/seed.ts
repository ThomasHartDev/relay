import { PrismaClient } from "../src/generated/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.workflowExecution.deleteMany();
  await prisma.workflowEdge.deleteMany();
  await prisma.workflowNode.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.sequenceEnrollment.deleteMany();
  await prisma.sequenceStep.deleteMany();
  await prisma.sequence.deleteMany();
  await prisma.tagOnDeal.deleteMany();
  await prisma.tagOnContact.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.user.deleteMany();

  // ─── Users ─────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "thomas@relay.dev",
        name: "Thomas Hart",
        passwordHash: "$2b$10$placeholder_hash_for_seed_data",
      },
    }),
    prisma.user.create({
      data: {
        email: "sarah@relay.dev",
        name: "Sarah Chen",
        passwordHash: "$2b$10$placeholder_hash_for_seed_data",
      },
    }),
    prisma.user.create({
      data: {
        email: "mike@relay.dev",
        name: "Mike Rodriguez",
        passwordHash: "$2b$10$placeholder_hash_for_seed_data",
      },
    }),
  ]);

  const [thomas, sarah, mike] = users;

  // ─── Companies ─────────────────────────────────────
  const companies = await Promise.all([
    prisma.company.create({
      data: { name: "Acme Corp", domain: "acme.com", industry: "Technology", size: "ENTERPRISE" },
    }),
    prisma.company.create({
      data: { name: "Globex Inc", domain: "globex.io", industry: "Finance", size: "MEDIUM" },
    }),
    prisma.company.create({
      data: {
        name: "Initech",
        domain: "initech.com",
        industry: "Software",
        size: "SMALL",
      },
    }),
    prisma.company.create({
      data: { name: "Hooli", domain: "hooli.xyz", industry: "Technology", size: "ENTERPRISE" },
    }),
    prisma.company.create({
      data: {
        name: "Pied Piper",
        domain: "piedpiper.com",
        industry: "Technology",
        size: "STARTUP",
      },
    }),
    prisma.company.create({
      data: {
        name: "Stark Industries",
        domain: "stark.com",
        industry: "Manufacturing",
        size: "ENTERPRISE",
      },
    }),
    prisma.company.create({
      data: {
        name: "Wayne Enterprises",
        domain: "wayne.co",
        industry: "Conglomerate",
        size: "ENTERPRISE",
      },
    }),
    prisma.company.create({
      data: { name: "Umbrella Corp", domain: "umbrella.io", industry: "Biotech", size: "MEDIUM" },
    }),
  ]);

  // ─── Contacts ──────────────────────────────────────
  const contactData = [
    {
      email: "alice@acme.com",
      firstName: "Alice",
      lastName: "Johnson",
      title: "CTO",
      status: "CUSTOMER" as const,
      company: companies[0],
      owner: thomas,
    },
    {
      email: "bob@acme.com",
      firstName: "Bob",
      lastName: "Smith",
      title: "VP Engineering",
      status: "CUSTOMER" as const,
      company: companies[0],
      owner: thomas,
    },
    {
      email: "carol@globex.io",
      firstName: "Carol",
      lastName: "Williams",
      title: "Head of Product",
      status: "PROSPECT" as const,
      company: companies[1],
      owner: sarah,
    },
    {
      email: "dave@globex.io",
      firstName: "Dave",
      lastName: "Brown",
      title: "CFO",
      status: "LEAD" as const,
      company: companies[1],
      owner: sarah,
    },
    {
      email: "eve@initech.com",
      firstName: "Eve",
      lastName: "Davis",
      title: "CEO",
      status: "CUSTOMER" as const,
      company: companies[2],
      owner: mike,
    },
    {
      email: "frank@hooli.xyz",
      firstName: "Frank",
      lastName: "Miller",
      title: "Director of Sales",
      status: "PROSPECT" as const,
      company: companies[3],
      owner: thomas,
    },
    {
      email: "grace@piedpiper.com",
      firstName: "Grace",
      lastName: "Wilson",
      title: "Co-founder",
      status: "LEAD" as const,
      company: companies[4],
      owner: sarah,
    },
    {
      email: "hank@stark.com",
      firstName: "Hank",
      lastName: "Moore",
      title: "VP Operations",
      status: "CUSTOMER" as const,
      company: companies[5],
      owner: mike,
    },
    {
      email: "iris@wayne.co",
      firstName: "Iris",
      lastName: "Taylor",
      title: "Head of Procurement",
      status: "PROSPECT" as const,
      company: companies[6],
      owner: thomas,
    },
    {
      email: "jack@umbrella.io",
      firstName: "Jack",
      lastName: "Anderson",
      title: "Lab Director",
      status: "LEAD" as const,
      company: companies[7],
      owner: sarah,
    },
    {
      email: "kate@example.com",
      firstName: "Kate",
      lastName: "Thomas",
      title: "Freelance Consultant",
      status: "LEAD" as const,
      company: null,
      owner: mike,
    },
    {
      email: "leo@example.com",
      firstName: "Leo",
      lastName: "Garcia",
      title: "Marketing Director",
      status: "PROSPECT" as const,
      company: null,
      owner: thomas,
    },
    {
      email: "mia@acme.com",
      firstName: "Mia",
      lastName: "Martinez",
      title: "Product Manager",
      status: "CUSTOMER" as const,
      company: companies[0],
      owner: sarah,
    },
    {
      email: "nick@hooli.xyz",
      firstName: "Nick",
      lastName: "Lee",
      title: "Engineering Manager",
      status: "CHURNED" as const,
      company: companies[3],
      owner: mike,
    },
    {
      email: "olivia@stark.com",
      firstName: "Olivia",
      lastName: "White",
      title: "Supply Chain Lead",
      status: "CUSTOMER" as const,
      company: companies[5],
      owner: thomas,
    },
    {
      email: "paul@initech.com",
      firstName: "Paul",
      lastName: "Harris",
      title: "Developer",
      status: "PROSPECT" as const,
      company: companies[2],
      owner: sarah,
    },
    {
      email: "quinn@piedpiper.com",
      firstName: "Quinn",
      lastName: "Clark",
      title: "CTO",
      status: "LEAD" as const,
      company: companies[4],
      owner: mike,
    },
    {
      email: "rachel@wayne.co",
      firstName: "Rachel",
      lastName: "Lewis",
      title: "General Counsel",
      status: "PROSPECT" as const,
      company: companies[6],
      owner: thomas,
    },
    {
      email: "sam@globex.io",
      firstName: "Sam",
      lastName: "Young",
      title: "Data Scientist",
      status: "LEAD" as const,
      company: companies[1],
      owner: sarah,
    },
    {
      email: "tara@umbrella.io",
      firstName: "Tara",
      lastName: "King",
      title: "Research Lead",
      status: "ARCHIVED" as const,
      company: companies[7],
      owner: mike,
    },
  ];

  const contacts = await Promise.all(
    contactData.map((c) =>
      prisma.contact.create({
        data: {
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          title: c.title,
          status: c.status,
          companyId: c.company?.id,
          ownerId: c.owner?.id,
        },
      }),
    ),
  );

  // ─── Tags ──────────────────────────────────────────
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Enterprise", color: "#6366F1" } }),
    prisma.tag.create({ data: { name: "Hot Lead", color: "#EF4444" } }),
    prisma.tag.create({ data: { name: "Referral", color: "#22C55E" } }),
    prisma.tag.create({ data: { name: "Decision Maker", color: "#F97316" } }),
    prisma.tag.create({ data: { name: "Technical", color: "#3B82F6" } }),
    prisma.tag.create({ data: { name: "VIP", color: "#EAB308" } }),
  ]);

  // Tag some contacts
  await Promise.all([
    prisma.tagOnContact.create({ data: { contactId: contacts[0]!.id, tagId: tags[0]!.id } }),
    prisma.tagOnContact.create({ data: { contactId: contacts[0]!.id, tagId: tags[3]!.id } }),
    prisma.tagOnContact.create({ data: { contactId: contacts[5]!.id, tagId: tags[1]!.id } }),
    prisma.tagOnContact.create({ data: { contactId: contacts[7]!.id, tagId: tags[5]!.id } }),
    prisma.tagOnContact.create({ data: { contactId: contacts[4]!.id, tagId: tags[0]!.id } }),
    prisma.tagOnContact.create({ data: { contactId: contacts[2]!.id, tagId: tags[2]!.id } }),
  ]);

  // ─── Deals ─────────────────────────────────────────
  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86400000);

  const deals = await Promise.all([
    prisma.deal.create({
      data: {
        title: "Acme Enterprise License",
        value: 120000,
        stage: "NEGOTIATION",
        contactId: contacts[0]!.id,
        companyId: companies[0]!.id,
        ownerId: thomas!.id,
        closeDate: inDays(14),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Globex Analytics Platform",
        value: 45000,
        stage: "PROPOSAL",
        contactId: contacts[2]!.id,
        companyId: companies[1]!.id,
        ownerId: sarah!.id,
        closeDate: inDays(30),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Initech CRM Migration",
        value: 28000,
        stage: "QUALIFIED",
        contactId: contacts[4]!.id,
        companyId: companies[2]!.id,
        ownerId: mike!.id,
        closeDate: inDays(45),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Hooli Data Integration",
        value: 85000,
        stage: "PROSPECT",
        contactId: contacts[5]!.id,
        companyId: companies[3]!.id,
        ownerId: thomas!.id,
        closeDate: inDays(60),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Pied Piper Starter Plan",
        value: 12000,
        stage: "PROSPECT",
        contactId: contacts[6]!.id,
        companyId: companies[4]!.id,
        ownerId: sarah!.id,
        closeDate: inDays(21),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Stark Manufacturing Suite",
        value: 250000,
        stage: "WON",
        contactId: contacts[7]!.id,
        companyId: companies[5]!.id,
        ownerId: mike!.id,
        closeDate: inDays(-10),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Wayne Security Audit",
        value: 75000,
        stage: "PROPOSAL",
        contactId: contacts[8]!.id,
        companyId: companies[6]!.id,
        ownerId: thomas!.id,
        closeDate: inDays(20),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Umbrella Research License",
        value: 35000,
        stage: "LOST",
        contactId: contacts[9]!.id,
        companyId: companies[7]!.id,
        ownerId: sarah!.id,
        lostReason: "Went with competitor",
      },
    }),
    prisma.deal.create({
      data: {
        title: "Acme Team Expansion",
        value: 60000,
        stage: "QUALIFIED",
        contactId: contacts[1]!.id,
        companyId: companies[0]!.id,
        ownerId: thomas!.id,
        closeDate: inDays(35),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Globex Consulting Retainer",
        value: 18000,
        stage: "NEGOTIATION",
        contactId: contacts[3]!.id,
        companyId: companies[1]!.id,
        ownerId: sarah!.id,
        closeDate: inDays(7),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Stark Maintenance Contract",
        value: 95000,
        stage: "WON",
        contactId: contacts[14]!.id,
        companyId: companies[5]!.id,
        ownerId: thomas!.id,
        closeDate: inDays(-5),
      },
    }),
    prisma.deal.create({
      data: {
        title: "Wayne Enterprise Package",
        value: 180000,
        stage: "QUALIFIED",
        contactId: contacts[17]!.id,
        companyId: companies[6]!.id,
        ownerId: mike!.id,
        closeDate: inDays(50),
      },
    }),
  ]);

  // Tag some deals
  await Promise.all([
    prisma.tagOnDeal.create({ data: { dealId: deals[0]!.id, tagId: tags[0]!.id } }),
    prisma.tagOnDeal.create({ data: { dealId: deals[5]!.id, tagId: tags[5]!.id } }),
    prisma.tagOnDeal.create({ data: { dealId: deals[3]!.id, tagId: tags[1]!.id } }),
  ]);

  // ─── Activities ────────────────────────────────────
  const activityData = [
    {
      type: "CALL" as const,
      title: "Discovery call with Alice",
      userId: thomas!.id,
      contactId: contacts[0]!.id,
      dealId: deals[0]!.id,
      dueDate: inDays(-2),
      completedAt: inDays(-2),
    },
    {
      type: "EMAIL" as const,
      title: "Send proposal to Carol",
      userId: sarah!.id,
      contactId: contacts[2]!.id,
      dealId: deals[1]!.id,
      dueDate: inDays(-1),
      completedAt: inDays(-1),
    },
    {
      type: "MEETING" as const,
      title: "Quarterly review with Acme",
      userId: thomas!.id,
      contactId: contacts[0]!.id,
      dealId: deals[0]!.id,
      dueDate: inDays(1),
      completedAt: null,
    },
    {
      type: "TASK" as const,
      title: "Prepare contract for Globex",
      userId: sarah!.id,
      contactId: contacts[3]!.id,
      dealId: deals[9]!.id,
      dueDate: inDays(2),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Follow up with Frank",
      userId: thomas!.id,
      contactId: contacts[5]!.id,
      dealId: deals[3]!.id,
      dueDate: inDays(3),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Send onboarding docs to Hank",
      userId: mike!.id,
      contactId: contacts[7]!.id,
      dealId: deals[5]!.id,
      dueDate: inDays(-3),
      completedAt: inDays(-3),
    },
    {
      type: "MEETING" as const,
      title: "Demo for Pied Piper team",
      userId: sarah!.id,
      contactId: contacts[6]!.id,
      dealId: deals[4]!.id,
      dueDate: inDays(5),
      completedAt: null,
    },
    {
      type: "TASK" as const,
      title: "Update CRM migration timeline",
      userId: mike!.id,
      contactId: contacts[4]!.id,
      dealId: deals[2]!.id,
      dueDate: inDays(-1),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Negotiate terms with Iris",
      userId: thomas!.id,
      contactId: contacts[8]!.id,
      dealId: deals[6]!.id,
      dueDate: inDays(4),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Welcome email to Kate",
      userId: mike!.id,
      contactId: contacts[10]!.id,
      dueDate: inDays(0),
      completedAt: null,
    },
    {
      type: "MEETING" as const,
      title: "Strategy session - Stark deal",
      userId: thomas!.id,
      contactId: contacts[14]!.id,
      dealId: deals[10]!.id,
      dueDate: inDays(-5),
      completedAt: inDays(-5),
    },
    {
      type: "TASK" as const,
      title: "Review Wayne proposal",
      userId: thomas!.id,
      contactId: contacts[8]!.id,
      dealId: deals[6]!.id,
      dueDate: inDays(0),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Check in with Eve",
      userId: mike!.id,
      contactId: contacts[4]!.id,
      dueDate: inDays(7),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Send pricing to Leo",
      userId: thomas!.id,
      contactId: contacts[11]!.id,
      dueDate: inDays(1),
      completedAt: null,
    },
    {
      type: "MEETING" as const,
      title: "Initech requirements gathering",
      userId: mike!.id,
      contactId: contacts[4]!.id,
      dealId: deals[2]!.id,
      dueDate: inDays(-7),
      completedAt: inDays(-7),
    },
    {
      type: "TASK" as const,
      title: "Update deal pipeline report",
      userId: sarah!.id,
      dueDate: inDays(2),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Intro call with Sam",
      userId: sarah!.id,
      contactId: contacts[18]!.id,
      dueDate: inDays(6),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Follow up on Globex analytics",
      userId: sarah!.id,
      contactId: contacts[2]!.id,
      dealId: deals[1]!.id,
      dueDate: inDays(3),
      completedAt: null,
    },
    {
      type: "MEETING" as const,
      title: "Acme expansion planning",
      userId: thomas!.id,
      contactId: contacts[1]!.id,
      dealId: deals[8]!.id,
      dueDate: inDays(10),
      completedAt: null,
    },
    {
      type: "TASK" as const,
      title: "Prepare Q1 sales report",
      userId: mike!.id,
      dueDate: inDays(14),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Closing call - Acme license",
      userId: thomas!.id,
      contactId: contacts[0]!.id,
      dealId: deals[0]!.id,
      dueDate: inDays(5),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Send case study to Grace",
      userId: sarah!.id,
      contactId: contacts[6]!.id,
      dealId: deals[4]!.id,
      dueDate: inDays(2),
      completedAt: null,
    },
    {
      type: "MEETING" as const,
      title: "Wayne security review meeting",
      userId: thomas!.id,
      contactId: contacts[17]!.id,
      dealId: deals[11]!.id,
      dueDate: inDays(8),
      completedAt: null,
    },
    {
      type: "TASK" as const,
      title: "Clean up archived contacts",
      userId: mike!.id,
      dueDate: inDays(21),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Re-engagement call with Nick",
      userId: mike!.id,
      contactId: contacts[13]!.id,
      dueDate: inDays(4),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Monthly newsletter draft",
      userId: sarah!.id,
      dueDate: inDays(3),
      completedAt: null,
    },
    {
      type: "MEETING" as const,
      title: "Team pipeline review",
      userId: thomas!.id,
      dueDate: inDays(1),
      completedAt: null,
    },
    {
      type: "TASK" as const,
      title: "Update Hooli contact info",
      userId: thomas!.id,
      contactId: contacts[5]!.id,
      dueDate: inDays(0),
      completedAt: null,
    },
    {
      type: "CALL" as const,
      title: "Rachel contract discussion",
      userId: thomas!.id,
      contactId: contacts[17]!.id,
      dealId: deals[11]!.id,
      dueDate: inDays(6),
      completedAt: null,
    },
    {
      type: "EMAIL" as const,
      title: "Proposal revision for Wayne",
      userId: thomas!.id,
      contactId: contacts[8]!.id,
      dealId: deals[6]!.id,
      dueDate: inDays(2),
      completedAt: null,
    },
  ];

  await Promise.all(
    activityData.map((a) =>
      prisma.activity.create({
        data: {
          type: a.type,
          title: a.title,
          userId: a.userId,
          contactId: a.contactId ?? undefined,
          dealId: a.dealId ?? undefined,
          dueDate: a.dueDate,
          completedAt: a.completedAt ?? undefined,
        },
      }),
    ),
  );

  // ─── Notes ─────────────────────────────────────────
  await Promise.all([
    prisma.note.create({
      data: {
        content:
          "Alice is the key decision maker. Technical background, prefers detailed proposals.",
        userId: thomas!.id,
        contactId: contacts[0]!.id,
        pinned: true,
      },
    }),
    prisma.note.create({
      data: {
        content:
          "Globex team is evaluating three vendors. We need to differentiate on integration speed.",
        userId: sarah!.id,
        companyId: companies[1]!.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Close date pushed back two weeks due to internal budget review.",
        userId: thomas!.id,
        dealId: deals[0]!.id,
      },
    }),
    prisma.note.create({
      data: {
        content:
          "Eve mentioned they're expanding to a second office. Potential upsell opportunity.",
        userId: mike!.id,
        contactId: contacts[4]!.id,
      },
    }),
    prisma.note.create({
      data: {
        content: "Wayne team requires SOC 2 compliance documentation before signing.",
        userId: thomas!.id,
        companyId: companies[6]!.id,
        pinned: true,
      },
    }),
  ]);

  // ─── Sequences ─────────────────────────────────────
  const sequence = await prisma.sequence.create({
    data: {
      name: "New Lead Welcome",
      status: "ACTIVE",
      steps: {
        create: [
          {
            type: "EMAIL",
            order: 0,
            subject: "Welcome to Relay!",
            body: "Hi {{firstName}}, thanks for your interest...",
          },
          { type: "DELAY", order: 1, delayMs: 172800000 },
          {
            type: "EMAIL",
            order: 2,
            subject: "Quick question",
            body: "Hi {{firstName}}, I wanted to follow up...",
          },
          { type: "CONDITION", order: 3, conditionType: "REPLIED" },
          {
            type: "EMAIL",
            order: 4,
            subject: "One more thing",
            body: "Hi {{firstName}}, I noticed you haven't replied...",
          },
        ],
      },
    },
  });

  await prisma.sequence.create({
    data: {
      name: "Re-engagement Campaign",
      status: "DRAFT",
      steps: {
        create: [
          {
            type: "EMAIL",
            order: 0,
            subject: "We miss you!",
            body: "Hi {{firstName}}, it's been a while...",
          },
          { type: "DELAY", order: 1, delayMs: 259200000 },
          {
            type: "EMAIL",
            order: 2,
            subject: "Special offer inside",
            body: "Hi {{firstName}}, we have something special...",
          },
        ],
      },
    },
  });

  // Enroll a couple contacts
  await prisma.sequenceEnrollment.create({
    data: { contactId: contacts[6]!.id, sequenceId: sequence.id, status: "ACTIVE" },
  });
  await prisma.sequenceEnrollment.create({
    data: { contactId: contacts[10]!.id, sequenceId: sequence.id, status: "ACTIVE" },
  });

  // ─── Workflows ─────────────────────────────────────
  const workflow = await prisma.workflow.create({
    data: {
      name: "Lead Qualification",
      description: "Automatically qualify new leads based on company size",
      status: "ACTIVE",
      triggerType: "CONTACT_CREATED",
    },
  });

  const triggerNode = await prisma.workflowNode.create({
    data: {
      type: "TRIGGER",
      label: "Contact Created",
      workflowId: workflow.id,
      positionX: 250,
      positionY: 50,
      config: { triggerType: "CONTACT_CREATED" },
    },
  });

  const conditionNode = await prisma.workflowNode.create({
    data: {
      type: "CONDITION",
      label: "Is Enterprise?",
      workflowId: workflow.id,
      positionX: 250,
      positionY: 200,
      config: { field: "company.size", operator: "equals", value: "ENTERPRISE" },
    },
  });

  const actionNode = await prisma.workflowNode.create({
    data: {
      type: "ACTION",
      label: "Assign to Sales",
      workflowId: workflow.id,
      positionX: 100,
      positionY: 350,
      config: { actionType: "ASSIGN_OWNER" },
    },
  });

  const tagNode = await prisma.workflowNode.create({
    data: {
      type: "ACTION",
      label: "Add VIP Tag",
      workflowId: workflow.id,
      positionX: 400,
      positionY: 350,
      config: { actionType: "ADD_TAG", tagName: "VIP" },
    },
  });

  await Promise.all([
    prisma.workflowEdge.create({
      data: {
        sourceNodeId: triggerNode.id,
        targetNodeId: conditionNode.id,
        workflowId: workflow.id,
      },
    }),
    prisma.workflowEdge.create({
      data: {
        sourceNodeId: conditionNode.id,
        targetNodeId: actionNode.id,
        workflowId: workflow.id,
        label: "Yes",
      },
    }),
    prisma.workflowEdge.create({
      data: {
        sourceNodeId: conditionNode.id,
        targetNodeId: tagNode.id,
        workflowId: workflow.id,
        label: "No",
      },
    }),
  ]);

  console.log("Seed complete:");
  console.log(`  ${users.length} users`);
  console.log(`  ${companies.length} companies`);
  console.log(`  ${contacts.length} contacts`);
  console.log(`  ${deals.length} deals`);
  console.log(`  ${activityData.length} activities`);
  console.log(`  5 notes`);
  console.log(`  ${tags.length} tags`);
  console.log(`  2 sequences`);
  console.log(`  1 workflow`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
