import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validation';
import { createErrorResponse, createSuccessResponse, parseRequestBody } from '@/lib/api-utils';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await parseRequestBody(request);
    const { email, password, name } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createErrorResponse(new Error('User already exists'), 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return createSuccessResponse({ user });
  } catch (error) {
    return createErrorResponse(error);
  }
}
