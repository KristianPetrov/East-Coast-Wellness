import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password || password.length < 8) {
    return NextResponse.json(
      { message: "Name, email, and an 8+ character password are required." },
      { status: 400 },
    );
  }

  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return NextResponse.json(
      { message: "An account already exists for that email." },
      { status: 409 },
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const passwordHash = await hash(password, 12);

  await db.insert(users).values({
    name,
    email,
    passwordHash,
    role: adminEmail && adminEmail === email ? "admin" : "user",
  });

  return NextResponse.json({ ok: true });
}
