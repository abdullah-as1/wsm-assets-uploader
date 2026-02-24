import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { password } = await request.json();
  
  if (password === process.env.ADMIN_PASSWORD) {
    (await cookies()).set('auth', 'true', { httpOnly: true, maxAge: 86400 });
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
