import { NextResponse } from 'next/server';
import { Class } from '@/models/class.model';
import { connectToDB } from '@/lib/Database/connectToDB';

export async function GET() {
  try {
    await connectToDB();
    const classes = await Class.find().sort({ name: 1 });
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
