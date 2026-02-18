import { NextResponse } from "next/server";
import { prisma } from "@relay/db";
import { generateCsv } from "@relay/shared";
import { getAuthUser } from "@/lib/server/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const contacts = await prisma.contact.findMany({
    include: {
      company: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const exportData = contacts.map((c) => ({
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone ?? "",
    title: c.title ?? "",
    status: c.status,
    company: c.company?.name ?? "",
    createdAt: c.createdAt.toISOString().split("T")[0],
  }));

  const csv = generateCsv(exportData, [
    "firstName",
    "lastName",
    "email",
    "phone",
    "title",
    "status",
    "company",
    "createdAt",
  ]);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="contacts-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
