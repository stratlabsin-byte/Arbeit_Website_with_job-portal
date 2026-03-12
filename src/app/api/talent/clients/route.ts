import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Two-way sync between Company (admin panel) and Client (talent portal).
 * 1. Company → Client: create Client for each Company without one
 * 2. Client → Company: create Company for each Client without one (needs a system user)
 */
async function syncCompaniesAndClients() {
  // --- Company → Client ---
  const companiesWithoutClient = await prisma.company.findMany({
    where: { client: null },
  });

  for (const company of companiesWithoutClient) {
    const existingBySlug = await prisma.client.findUnique({
      where: { slug: company.slug },
    });

    if (existingBySlug) {
      await prisma.client.update({
        where: { id: existingBySlug.id },
        data: { companyId: company.id },
      });
    } else {
      await prisma.client.create({
        data: {
          companyId: company.id,
          name: company.name,
          slug: company.slug,
          industry: company.industry,
          website: company.website,
          logo: company.logo,
          contactEmail: company.email,
          contactPhone: company.phone,
          address: company.address,
          city: company.location,
          status: "ACTIVE",
        },
      });
    }
  }

  // --- Client → Company ---
  const clientsWithoutCompany = await prisma.client.findMany({
    where: { companyId: null },
  });

  if (clientsWithoutCompany.length > 0) {
    // Find or create a system admin user to own these companies
    let systemUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    if (!systemUser) return; // Can't create companies without an owner

    for (const client of clientsWithoutCompany) {
      // Check if a company with same slug already exists
      const existingCompany = await prisma.company.findUnique({
        where: { slug: client.slug },
      });

      if (existingCompany) {
        await prisma.client.update({
          where: { id: client.id },
          data: { companyId: existingCompany.id },
        });
      } else {
        // Check userId uniqueness — each company needs a unique userId
        // Use a dummy approach: find an unused user or reuse admin
        const existingCompanyForUser = await prisma.company.findUnique({
          where: { userId: systemUser.id },
        });

        if (existingCompanyForUser) {
          // Admin already has a company. Create a placeholder user for this company.
          const placeholderUser = await prisma.user.create({
            data: {
              name: client.name,
              email: `company-${client.slug}@system.arbeit.local`,
              role: "EMPLOYER",
            },
          });
          const newCompany = await prisma.company.create({
            data: {
              userId: placeholderUser.id,
              name: client.name,
              slug: client.slug,
              industry: client.industry,
              website: client.website,
              logo: client.logo,
              email: client.contactEmail,
              phone: client.contactPhone,
              address: client.address,
              location: client.city,
              isVerified: true,
            },
          });
          await prisma.client.update({
            where: { id: client.id },
            data: { companyId: newCompany.id },
          });
        } else {
          const newCompany = await prisma.company.create({
            data: {
              userId: systemUser.id,
              name: client.name,
              slug: client.slug,
              industry: client.industry,
              website: client.website,
              logo: client.logo,
              email: client.contactEmail,
              phone: client.contactPhone,
              address: client.address,
              location: client.city,
              isVerified: true,
            },
          });
          await prisma.client.update({
            where: { id: client.id },
            data: { companyId: newCompany.id },
          });
        }
      }
    }
  }
}

// GET /api/talent/clients - List all clients (synced with admin companies)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Auto-sync companies from admin panel
  await syncCompaniesAndClients();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { contactName: { contains: search } },
      { industry: { contains: search } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const [clients, total] = await Promise.all([
    prisma.client.findMany({
      where,
      include: {
        company: { select: { id: true, isVerified: true, location: true } },
        _count: { select: { requisitions: true, clientUsers: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.client.count({ where }),
  ]);

  return NextResponse.json({
    data: clients,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// POST /api/talent/clients - Create a new client
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, industry, website, logo, contactName, contactEmail, contactPhone, address, city, state, notes } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Check for duplicate slug
  const existing = await prisma.client.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A client with a similar name already exists" }, { status: 400 });
  }

  const client = await prisma.client.create({
    data: {
      name: name.trim(),
      slug,
      industry,
      website,
      logo,
      contactName,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      notes,
    },
  });

  return NextResponse.json({ data: client }, { status: 201 });
}
