import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Chave secreta do webhook (deve ser configurada no Clerk e no .env)
const webhookSecret = process.env.WEBHOOK_SECRET;

async function validateRequest(request: Request) {
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Validar se todos os headers necessários estão presentes
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return { isValid: false, message: 'Headers de webhook ausentes' };
  }

  // Obter o corpo da requisição como texto
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Criar objeto de headers para validação
  const svixHeaders = {
    "svix-id": svix_id,
    "svix-timestamp": svix_timestamp,
    "svix-signature": svix_signature,
  };

  // Validar a assinatura do webhook
  try {
    const wh = new Webhook(webhookSecret || '');
    wh.verify(body, svixHeaders);
    return { isValid: true, payload };
  } catch (err) {
    console.error('Erro na validação do webhook:', err);
    return { isValid: false, message: 'Assinatura inválida' };
  }
}

export async function POST(request: Request) {
  try {
    const { isValid, message, payload } = await validateRequest(request);

    if (!isValid) {
      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }

    // Tipar o evento do webhook
    const evt = payload as WebhookEvent;

    // Lidar com diferentes tipos de eventos
    console.log(evt.type);
    switch (evt.type) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      // Adicione outros casos conforme necessário
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções para lidar com eventos específicos
async function handleUserCreated(userData: any) {
  try {
    // Exemplo: Criar usuário no seu backend/Strapi
    // const response = await fetch(`${process.env.HOST}/api/customers`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     data: {
    //       first_name: userData.first_name || '',
    //       last_name: userData.last_name || '',
    //       email: userData.email_addresses[0]?.email_address || '',
    //       phone: userData.phone_numbers[0]?.phone_number || 'Não informado',
    //       clerk_id: userData.id, // Armazenar o ID do Clerk para referência
    //     }
    //   })
    // });

    // if (!response.ok) {
    //   throw new Error('Erro ao criar usuário no Strapi');
    // }

    console.log('Usuário criado com sucesso no Strapi');
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

async function handleUserUpdated(userData: any) {
  try {
    // Primeiro, buscar o usuário no Strapi pelo clerk_id
    const searchResponse = await fetch(
      `${process.env.HOST}/api/customers?filters[clerk_id][$eq]=${userData.id}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
        },
      }
    );

    const searchData = await searchResponse.json();
    if (!searchData.data?.[0]?.id) {
      throw new Error('Usuário não encontrado no Strapi');
    }

    // Atualizar o usuário no Strapi
    const updateResponse = await fetch(
      `${process.env.HOST}/api/customers/${searchData.data[0].id}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.STRAPI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            email: userData.email_addresses[0]?.email_address || '',
            phone: userData.phone_numbers[0]?.phone_number || 'Não informado',
          }
        })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Erro ao atualizar usuário no Strapi');
    }

    console.log('Usuário atualizado com sucesso no Strapi');
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
}

async function handleUserDeleted(userData: any) {
  try {
    // Implementar lógica de deleção se necessário
    console.log('Usuário deletado:', userData.id);
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw error;
  }
} 