import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found", email });
    }

    if (!user.hashedPassword) {
      return NextResponse.json({ error: "No password set (OAuth-only account)", email });
    }

    const isValid = await bcrypt.compare(password, user.hashedPassword);

    return NextResponse.json({
      userFound: true,
      email: user.email,
      name: user.name,
      role: user.role,
      hasHashedPassword: !!user.hashedPassword,
      hashPrefix: user.hashedPassword.substring(0, 7),
      passwordMatch: isValid,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
