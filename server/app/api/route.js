// Simple endpoint to check if the server is running
import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({ message: 'Task Collab is up and running 🚀' });
}
