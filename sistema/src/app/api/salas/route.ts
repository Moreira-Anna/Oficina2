import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const eventoId = searchParams.get("eventoId");

    const where = eventoId ? { eventoId } : {};

    const salas = await prisma.sala.findMany({
      where,
      include: {
        evento: true,
        _count: {
          select: {
            registros: true
          }
        }
      },
      orderBy: {
        nome: "asc"
      }
    });

    return NextResponse.json(salas);
  } catch (error) {
    console.error("Erro ao buscar salas:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.cargo !== "supervisor") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const body = await request.json();
    const { nome, capacidade, eventoId } = body;

    if (!nome || !capacidade || !eventoId) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
    }

    const sala = await prisma.sala.create({
      data: {
        nome,
        capacidade,
        eventoId
      },
      include: {
        evento: true
      }
    });

    return NextResponse.json(sala, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar sala:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
