"use server";

import { ProductsAllResponse, ProductsData } from "../../types/product-all-strape";
import { ProductIdResponse } from "../../types/product-id-strape";

 

export const getProductById = async (id: string | string[]) => {
  const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

  if (!TOKEN_STRAPI) throw new Error("Token de API Shopify não encontrado");
  if (!HOST) throw new Error("Host não encontrado");
  // Buscar produto
  const productResponse = await fetch(
    `${HOST}/api/products/${id}?populate=*`,
    {
      headers: {
        "X-Shopify-Access-Token": TOKEN_STRAPI,
      },
    }
  );

  const productData = await productResponse.json();

  // Buscar variações
  const variationsResponse = await fetch(
    `http://localhost:1337/api/variations?populate=*`,
    {
      headers: {
        "X-Shopify-Access-Token": TOKEN_STRAPI,
      },
    }
  );

  const variationsData = await variationsResponse.json();
  // Associar variações ao produto
const productWithVariations = {
  ...productData,
    variants: variationsData.data.filter((variation: { attributes: { product: { data: { id: string } } } }) => 
      variation.attributes.product.data.id == id
    ),

  };

    return productWithVariations as ProductIdResponse ;
};

export const getAllProducts = async () => {
  const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;

    if (!TOKEN_STRAPI) throw new Error("Token de API Strapi não encontrado");
    if (!HOST) throw new Error("Host não encontrado");
 
    // Buscar produtos
    const productsResponse = await fetch(
     `${HOST}/api/products?populate=*`,
     {
       headers: {
          "Authorization": `Bearer ${TOKEN_STRAPI}`,
       },
     }
   );
   
    const productsData = await productsResponse.json(); // Atualizar a tipagem
     // Buscar variações
    const variationsResponse = await fetch(
     `http://localhost:1337/api/variations?populate=*`,
     {
       headers: {
          "Authorization": `Bearer ${TOKEN_STRAPI}`,
       },
     }
   );
 
    const variationsData = await variationsResponse.json();
 
    // Associar variações aos produtos
    const productsWithVariations = productsData.data.map((product: { id: any; attributes: any; }) => {
       const productVariations = variationsData.data.filter((variation: { attributes: { product: { data: { id: any; }; }; }; }) => 
          variation.attributes.product.data.id === product.id
       );
       return {
          ...product,
          attributes: {
             ...product.attributes,
             variants: productVariations.map((variation: { attributes: { min_size: any; max_size: any; price: any; weight: any; }; }) => ({
                min_size: variation.attributes.min_size,
                max_size: variation.attributes.max_size,
                price: variation.attributes.price,
                weight: variation.attributes.weight,
             })),
          },
       };
    });
 
   
    return productsWithVariations as ProductsData[]; // Retornar produtos com variações
 };

export const getProductsByFilter = async (filter:string): Promise<ProductsData[]> => {
  const HOST = process.env.HOST;
	const TOKEN_STRAPI = process.env.STRAPI_TOKEN;
  if (!TOKEN_STRAPI) throw new Error("Token de API Strapi não encontrado");
  if (!HOST) throw new Error("Host não encontrado");

     const productsResponse = await fetch(
   `${HOST}/api/products?populate=*&${filter}`,
   {
     headers: {
        "Authorization": `Bearer ${TOKEN_STRAPI}`,
     },
   }
 );


 
  const productsData:ProductsAllResponse = await productsResponse.json() 
  
return productsData.data;  


};