import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    // CSRF-like validation: ensure proper Content-Type
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid Content-Type. Expected application/json." },
        { status: 415 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, role, workStatus, companyName } =
      body;

    // ---- Validation ----
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password, and role are required." },
        { status: 400 }
      );
    }

    if (!["JOB_SEEKER", "EMPLOYER"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be JOB_SEEKER or EMPLOYER." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (role === "EMPLOYER" && !companyName) {
      return NextResponse.json(
        { error: "Company name is required for employer registration." },
        { status: 400 }
      );
    }

    // ---- Check for duplicate email ----
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // ---- Hash password ----
    const hashedPassword = await bcrypt.hash(password, 12);

    // ---- Create user + related records in a transaction ----
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          hashedPassword,
          phone: phone || null,
          role,
        },
      });

      if (role === "EMPLOYER") {
        const slug = slugify(companyName);

        // Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;
        while (await tx.company.findUnique({ where: { slug: uniqueSlug } })) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }

        await tx.company.create({
          data: {
            name: companyName,
            slug: uniqueSlug,
            userId: newUser.id,
          },
        });
      }

      if (role === "JOB_SEEKER") {
        await tx.jobSeekerProfile.create({
          data: {
            userId: newUser.id,
            workStatus: workStatus || "FRESHER",
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
