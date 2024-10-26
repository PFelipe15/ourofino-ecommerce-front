/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint:{
        ignoreDuringBuilds:true
    },
     images:{
        remotePatterns:[
            {
                hostname: 'images.tcdn.com.br',
                
            },
            {
                hostname: 'cdn.shopify.com',
                
            },
            {
                hostname:'img.clerk.com'
            },
            {
                hostname: 'www.mercadopago.com',
                
            },{
                hostname: 'http2.mlstatic.com',
            },
            {
                hostname: 'sandbox.melhorenvio.com.br',
            },
            {
                hostname: 'storage.googleapis.com',
            }
        ]
    }
};

export default nextConfig;
