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
    const jogoId = searchParams.get("jogoId");
    const participanteId = searchParams.get("participanteId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: {
      eventoId?: string;
      jogoId?: string;
      participantes?: { some: { participanteId: string } };
    } = {};
    
    if (eventoId) where.eventoId = eventoId;
    if (jogoId) where.jogoId = jogoId;
    if (participanteId) {
      where.participantes = {
        some: {
          participanteId: participanteId
        }
      };
    }

    const registros = await prisma.registroJogo.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        dataInicio: "desc"
      },
      include: {
        jogo: true,
        evento: true,
        sala: true,
        participantes: {
          include: {
            participante: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                idade: true
              }
            }
          }
        }
      }
    });

    const total = await prisma.registroJogo.count({ where });

    return NextResponse.json({
      registros,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Erro ao buscar registros:", error);
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
    const { jogoId, eventoId, salaId, participanteIds, observacoes } = body;

    if (!jogoId || !eventoId || !salaId || !participanteIds || !Array.isArray(participanteIds)) {
      return NextResponse.json({ error: "Dados obrigatórios não fornecidos" }, { status: 400 });
    }

    const registro = await prisma.registroJogo.create({
      data: {
        jogoId,
        eventoId,
        salaId,
        dataInicio: new Date(),
        observacoes,
        participantes: {
          create: participanteIds.map((participanteId: string) => ({
            participanteId
          }))
        }
      },
      include: {
        jogo: true,
        evento: true,
        sala: true,
        participantes: {
          include: {
            participante: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                idade: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(registro, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
