import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing lat or lng' }, { status: 400 });
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=pt-BR`;

  try {
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SeuAppName / 1.0 (seuemail@exemplo.com)'
      }
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocodificação Reversa falhou no servidor:", error);
    return NextResponse.json({ error: 'Failed to fetch geocode data' }, { status: 500 });
  }
}