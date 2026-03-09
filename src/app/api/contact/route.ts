import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone, jobTitle, company, message, consent } = body;

    // Validate required fields
    if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "First name is required and must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== "string" || lastName.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: "Last name is required and must be at least 2 characters." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: "Message is required and must be at least 10 characters." },
        { status: 400 }
      );
    }

    // Save to database
    const inquiry = await prisma.contactInquiry.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        jobTitle: jobTitle?.trim() || null,
        company: company?.trim() || null,
        message: message.trim(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your inquiry has been submitted successfully. We will get back to you shortly.",
        id: inquiry.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact form submission error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
