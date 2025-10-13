import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const address = searchParams.get("address");

  try {
    if (address) {
      // geocodificação direta (endereço → coordenadas)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
      );
      const data = await response.json();
      if (data.length === 0) {
        return NextResponse.json({ error: "Endereço não encontrado" }, { status: 404 });
      }
      return NextResponse.json(data[0]);
    }

    if (lat && lng) {
      // geocodificação reversa (coordenadas → endereço)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      if (!data) {
        return NextResponse.json({ error: "Não foi possível encontrar endereço" }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  } catch (error) {
    console.error("Erro na API de geocodificação:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
