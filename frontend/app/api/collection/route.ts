import { NextResponse } from 'next/server';
import { getValidToken } from '@/lib/api';

export async function GET() {
  try {
    const token = await getValidToken();
    
    // For now, return an empty array
    // In a real implementation, this would fetch from a database
    return NextResponse.json({
      success: true,
      data: []
    });
  } catch (error) {
    console.error('Collection fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch collection' },
      { status: 401 }
    );
  }
} 