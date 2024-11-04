import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, Store, Clock, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { AddressForm } from './AddressForm';
import { PickupInStore } from './PickupInStore';
import { ShippingOptions } from './ShippingOptions';
import { CartItem } from '@/store/useCartStore';

interface UserAddressProps {
  onNext: (method: string, addressData?: any, shippingOption?: any) => void;
  onPrevious: () => void;
  produtos: CartItem[];
}

export const UserAddress: React.FC<UserAddressProps> = ({ onNext, onPrevious, produtos }) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<any>(null);
  const [showShippingOptions, setShowShippingOptions] = useState(false);

  const deliveryMethods = [
    {
      id: 'Entrega',
      title: 'Utilizar endereço para entrega',
      icon: MapPin,
      description: 'Entrega rápida para o endereço selecionado',
      estimatedTime: '2-3 dias úteis',
      additionalInfo: 'Ideal para entregas recorrentes'
    },

    {
      id: 'Retirada',
      title: 'Retirar na loja física',
      icon: Store,
      description: 'Retire seu pedido diretamente em nossa loja',
      estimatedTime: 'Disponível em 1 dia útil',
      additionalInfo: 'Economize no frete e retire quando quiser'
    }
  ];

  const handleSelectMethod = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleAddressConfirm = (data: any) => {
    setAddressData(data);
    setShowShippingOptions(true);
  };

  const handleShippingOptionSelect = (option: any) => {
    onNext(selectedMethod!, addressData, option);
  };

  const handlePickupConfirm = (pickupData: any) => {
    onNext('pickup', pickupData);
  };

  const renderSelectedMethodComponent = () => {
    if (showShippingOptions) {
      return <ShippingOptions 
        zipCode={addressData?.attributes?.Cep} 
        produtos={produtos}
        onSelect={handleShippingOptionSelect} 
        onBack={() => setShowShippingOptions(false)} 
      />;
    }

    switch (selectedMethod) {
      case 'Entrega':
        return <AddressForm onConfirm={handleAddressConfirm}  />;
      case 'Retirada':
        return <PickupInStore onConfirm={handlePickupConfirm} />;
      default:
        return null;
    }
  };

  const handleBack = () => {
    if (showShippingOptions) {
      setShowShippingOptions(false);
    } else if (selectedMethod) {
      setSelectedMethod(null);
    } else {
      onPrevious();
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-2 rounded-lg shadow-sm">
      {!selectedMethod ? (
        <>
          <h2 className="text-2xl font-bold mb-2">Escolha o método de entrega</h2>
          <p className="text-sm text-gray-600 mb-4">Selecione a opção que melhor atende às suas necessidades</p>

          <div className="space-y-4">
            {deliveryMethods.map((method) => (
              <Card 
                key={method.id} 
                className={`cursor-pointer transition-all hover:bg-gray-50`}
                onClick={() => handleSelectMethod(method.id)}
              >
                <CardContent className="flex items-center p-4">
                  <method.icon className="text-yellow-600 mr-4" size={24} />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock size={14} className="mr-1" />
                      <span>{method.estimatedTime}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info size={14} className="ml-2 text-yellow-600" />
                          </TooltipTrigger>
                          <TooltipContent>{method.additionalInfo}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        renderSelectedMethodComponent()
      )}

      <div className="mt-8">
        <Button onClick={handleBack} variant="outline" className="w-full mb-3">
          {showShippingOptions 
            ? 'Voltar para seleção de endereço' 
            : selectedMethod 
              ? 'Voltar para métodos de entrega' 
              : 'Voltar para o carrinho'}
        </Button>
      </div>
    </div>
  );
};
