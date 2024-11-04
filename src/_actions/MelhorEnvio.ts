'use server'

import axios from 'axios';
import { ResponseDataMelhorEnvio } from '../../types/melhor-envio';
import { CartItem } from '@/store/useCartStore';


interface CotacaoFrete {
  from: {
    postal_code: string;
  };
  to: {
    postal_code: string;
  };
  products: {
    id: string;
    width: number;
    height: number;
    length: number;
    weight: number;
    insurance_value: number;
    quantity: number;
  }[];
}


const AccessToken = process.env.MELHOR_ENVIO_TOKEN;
 export const cotarFreteCliente = async (cep: string, produtos: CartItem[]): Promise<ResponseDataMelhorEnvio[]> => {

  try {
    // Validação do CEP
    if (!cep) {
      throw new Error('CEP de destino é obrigatório');
    }

    const data: CotacaoFrete = {
      from: {
        postal_code: "96020360", // CEP de origem atualizado
      },
      to: {
        postal_code: cep.replace(/\D/g, ''), // Remove caracteres não numéricos do CEP
      },
      products: produtos.map(produto => ({
        id: produto.id.toString(),
        width: produto.attributes.altura || 11, // Use valores padrão caso não existam
        height: produto.attributes.largura || 17,
        length: produto.attributes.comprimento || 11,
        weight: produto.attributes.peso || 0.3,
        insurance_value: produto.price || 0, // Adicionado valor padrão 0
        quantity: produto.quantity
      })),
    };

    // Log para debug
    console.log('Dados enviados para cotação:', JSON.stringify(data, null, 2));

    const response = await axios.post<ResponseDataMelhorEnvio[]>(
      'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
      data,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AccessToken}`,
        },
      }
    );

    if (!response.data || response.data.length === 0) {
      throw new Error('Nenhuma cotação de frete disponível');
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Erro na requisição:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 422) {
        throw new Error('Dados inválidos para cotação. Verifique o CEP e as dimensões do produto.');
      }
    }
    
    console.error('Erro ao cotar frete:', error);
    throw new Error('Não foi possível realizar a cotação do frete');
  }
};

 

