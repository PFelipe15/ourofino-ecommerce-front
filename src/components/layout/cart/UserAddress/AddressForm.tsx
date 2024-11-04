import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from "next/image";
import { createAddressForCustomer, getCustomerOrCreate } from '@/_actions/Customers';
import { useUser } from '@clerk/nextjs';
import { Daum2 } from '../../../../../types/customers-strape';
import { ModalDialog } from './ModalDialogAddress';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface AddressFormProps {
  onConfirm: (addressData: Daum2) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({ onConfirm }) => {
  // Estados
  const [savedAddresses, setSavedAddresses] = useState<Daum2[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Daum2 | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({
    Nome: '',
    Rua: '',
    Cep: '',
    Cidade: '',
    Bairro: '',
    Estado: '',
  });

  const { user } = useUser();

  // Carregar endereços salvos
  useEffect(() => {
    getUserAddresses();
  }, []);

  const getUserAddresses = async () => {
    setIsLoading(true);
    try {
      const userData = {
        data: {
          first_name: user?.firstName,
          last_name: user?.lastName,
          email: user?.emailAddresses[0]?.emailAddress,
          phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',
        }
      };
      const customerResponse = await getCustomerOrCreate(userData);
      const customerAddresses = customerResponse.attributes?.enderecos?.data || [];
      setSavedAddresses(customerAddresses);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {      
      await createAddressForCustomer(user?.emailAddresses[0]?.emailAddress, newAddress);
      await getUserAddresses();
      setIsAddingNew(false);
      setNewAddress({
        Nome: '',
        Rua: '',
        Cep: '',
        Cidade: '',
        Bairro: '',
        Estado: '',
      });
    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
    }
    setIsLoading(false);
  };

  const handleConfirm = () => {
    if (selectedAddress) {
      setIsModalOpen(true);
    }
  };

  const handleFinalConfirm = () => {
    if (selectedAddress) {
       onConfirm(selectedAddress);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="bg-white  transition-all duration-200">
      
      {/* Título com ícone */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-yellow-600" />
        <h2 className="text-lg font-medium">Endereço de Entrega</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
        </div>
      ) : (
        <div className="space-y-4">
          {savedAddresses.map((address) => (
            <div
              key={address.id}
              onClick={() => setSelectedAddress(address)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                selectedAddress?.id === address.id
                  ? 'border-yellow-600 bg-yellow-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex  items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{address.attributes.Nome}</span>
                    {selectedAddress?.id === address.id && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                        Selecionado <CheckCheck className="w-3 h-3"/>
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-600 text-sm flex flex-col gap-1 mt-1">
                    <p className="line-clamp-1">{address.attributes.Rua}</p>
                    <p className="text-xs text-gray-500">
                      {address.attributes.Bairro}, {address.attributes.Cidade} - {address.attributes.Estado}
                    </p>
                  <p className="text-xs text-gray-500">CEP: {address.attributes.Cep}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-yellow-600 hover:text-yellow-700 p-1 h-auto"
                  >
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {savedAddresses.length < 3 ? (
          <Button
            onClick={() => setIsAddingNew(true)}
            variant="outline"
            className="w-full py-3 border-dashed border-gray-300 hover:border-yellow-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
              <span className="text-gray-600">Adicionar novo endereço</span>
            </Button>
          ): <p className="text-gray-600 text-sm">Você só pode adicionar até 3 endereços</p>}

          {/* Botões de Ação */}
          <div className="space-y-3 mt-6">
            <Button
              onClick={handleFinalConfirm}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
              disabled={!selectedAddress}
            >
              Confirmar Endereço
            </Button>
           
          </div>
        </div>
      )}

     {/* Modal do novo endereço */}
     <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
       <DialogContent className="sm:max-w-[500px]">
         <form onSubmit={handleNewAddressSubmit} className="space-y-4">
           <h2 className="text-lg font-medium mb-4">Adicionar novo endereço</h2>
           
           <div className="space-y-4">
             <div>
               <Label htmlFor="Nome">Nome do endereço</Label>
               <Input
                 id="Nome"
                 name="Nome"
                 value={newAddress.Nome}
                 onChange={handleInputChange}
                 placeholder="Ex: Casa, Trabalho"
                 required
               />
             </div>

             <div>
               <Label htmlFor="Cep">CEP</Label>
               <Input
                 id="Cep"
                 name="Cep"
                 value={newAddress.Cep}
                 onChange={handleInputChange}
                 placeholder="00000-000"
                 required
               />
             </div>

             <div>
               <Label htmlFor="Rua">Rua</Label>
               <Input
                 id="Rua"
                 name="Rua"
                 value={newAddress.Rua}
                 onChange={handleInputChange}
                 placeholder="Nome da rua e número"
                 required
               />
             </div>

             <div>
               <Label htmlFor="Bairro">Bairro</Label>
               <Input
                 id="Bairro"
                 name="Bairro"
                 value={newAddress.Bairro}
                 onChange={handleInputChange}
                 placeholder="Seu bairro"
                 required
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label htmlFor="Cidade">Cidade</Label>
                 <Input
                   id="Cidade"
                   name="Cidade"
                   value={newAddress.Cidade}
                   onChange={handleInputChange}
                   placeholder="Sua cidade"
                   required
                 />
               </div>
               <div>
                 <Label htmlFor="Estado">Estado</Label>
                 <Input
                   id="Estado"
                   name="Estado"
                   value={newAddress.Estado}
                   onChange={handleInputChange}
                   placeholder="UF"
                   required
                 />
               </div>
             </div>

             <div className="flex gap-3 pt-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => setIsAddingNew(false)}
                 className="flex-1"
               >
                 Cancelar
               </Button>
               <Button
                 type="submit"
                 className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                 disabled={isLoading}
               >
                 {isLoading ? (
                   <Loader2 className="w-4 h-4 animate-spin" />
                 ) : (
                   'Salvar Endereço'
                 )}
               </Button>
             </div>
           </div>
         </form>
       </DialogContent>
     </Dialog>

    </div>
  );
};
