import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — List all inquiries with pagination and read/unread filter
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const filter = searchParams.get("filter"); // "read" | "unread" | null (all)

  const where: Record<string, unknown> = {};
  if (filter === "read") where.isRead = true;
  if (filter === "unread") where.isRead = false;

  const [inquiries, total, unreadCount] = await Promise.all([
    prisma.contactInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contactInquiry.count({ where }),
    prisma.contactInquiry.count({ where: { isRead: false } }),
  ]);

  return NextResponse.json({
    success: true,
    data: inquiries,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    unreadCount,
  });
}

// PATCH — Mark inquiry as read or unread
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, isRead } = body;

  if (!id || typeof isRead !== "boolean") {
    return NextResponse.json(
      { error: "id and isRead (boolean) are required" },
      { status: 400 }
    );
  }

  const inquiry = await prisma.contactInquiry.update({
    where: { id },
    data: { isRead },
  });

  return NextResponse.json({ success: true, data: inquiry });
}

// DELETE — Delete an inquiry by id
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "id query parameter is required" },
      { status: 400 }
    );
  }

  await prisma.contactInquiry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
