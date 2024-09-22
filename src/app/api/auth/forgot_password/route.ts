import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if the email exists or not for security reasons
      return NextResponse.json({
        message:
          "If a user with that email exists, a reset link has been sent.",
      });
    }

    // Generate a reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    // Here you would send an email with the reset link
    // The link would look something like: `https://yourapp.com/reset-password?token=${resetToken}`

    // For this example, we'll just log it
    console.log(
      `Reset link: https://yourapp.com/reset-password?token=${resetToken}`
    );

    return NextResponse.json({
      message: "If a user with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
