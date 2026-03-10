import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/talent/clients/[clientId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { clientId } = await params;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      requisitions: { orderBy: { createdAt: "desc" }, take: 10 },
      clientUsers: { include: { user: { select: { id: true, name: true, email: true } } } },
      clientRoles: true,
      _count: { select: { requisitions: true, clientUsers: true } },
    },
  });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  return NextResponse.json({ data: client });
}

// PUT /api/talent/clients/[clientId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "RECRUITER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { clientId } = await params;
  const body = await req.json();

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const updated = await prisma.client.update({
    where: { id: clientId },
    data: {
      name: body.name ?? client.name,
      industry: body.industry ?? client.industry,
      website: body.website ?? client.website,
      logo: body.logo ?? client.logo,
      contactName: body.contactName ?? client.contactName,
      contactEmail: body.contactEmail ?? client.contactEmail,
      contactPhone: body.contactPhone ?? client.contactPhone,
      address: body.address ?? client.address,
      city: body.city ?? client.city,
      state: body.state ?? client.state,
      notes: body.notes ?? client.notes,
      status: body.status ?? client.status,
    },
  });

  return NextResponse.json({ data: updated });
}

// DELETE /api/talent/clients/[clientId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can delete clients" }, { status: 403 });
  }

  const { clientId } = await params;

  // Soft delete — set status to INACTIVE
  await prisma.client.update({
    where: { id: clientId },
    data: { status: "INACTIVE" },
  });

  return NextResponse.json({ message: "Client deactivated" });
}
