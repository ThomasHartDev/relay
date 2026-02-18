import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@relay/db";
import type { ContactStatus } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

interface ImportContact {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  status?: string;
  company?: string;
}

interface ImportBody {
  contacts: ImportContact[];
  skipDuplicates: boolean;
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as ImportBody;
  const { contacts, skipDuplicates } = body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: "No contacts provided" }, { status: 400 });
  }

  if (contacts.length > 1000) {
    return NextResponse.json({ error: "Maximum 1000 contacts per import" }, { status: 400 });
  }

  // Check for existing emails if skipping duplicates
  const emails = contacts.map((c) => c.email.toLowerCase());
  const existing = await prisma.contact.findMany({
    where: { email: { in: emails } },
    select: { email: true },
  });
  const existingEmails = new Set(existing.map((e) => e.email.toLowerCase()));

  // Resolve company names to IDs
  const companyNames = [...new Set(contacts.map((c) => c.company).filter(Boolean))] as string[];
  const companies =
    companyNames.length > 0
      ? await prisma.company.findMany({
          where: { name: { in: companyNames, mode: "insensitive" } },
          select: { id: true, name: true },
        })
      : [];
  const companyMap = new Map(companies.map((c) => [c.name.toLowerCase(), c.id]));

  let imported = 0;
  let skipped = 0;
  const errors: { email: string; error: string }[] = [];

  for (const contact of contacts) {
    const emailLower = contact.email.toLowerCase();

    if (existingEmails.has(emailLower)) {
      if (skipDuplicates) {
        skipped++;
        continue;
      }
      errors.push({ email: contact.email, error: "Email already exists" });
      continue;
    }

    try {
      await prisma.contact.create({
        data: {
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: emailLower,
          phone: contact.phone || null,
          title: contact.title || null,
          status: (contact.status as ContactStatus) || "LEAD",
          companyId: contact.company
            ? (companyMap.get(contact.company.toLowerCase()) ?? null)
            : null,
          ownerId: user.id,
        },
      });
      imported++;
      existingEmails.add(emailLower);
    } catch {
      errors.push({ email: contact.email, error: "Failed to create contact" });
    }
  }

  return NextResponse.json({
    data: {
      imported,
      skipped,
      failed: errors.length,
      total: contacts.length,
      errors: errors.slice(0, 20),
    },
  });
}
