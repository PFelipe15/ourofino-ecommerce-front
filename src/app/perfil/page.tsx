'use client'
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'react-hot-toast';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const ProfilePage = () => {
  const { user } = useUser();
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [phone, setPhone] = useState('');

  useEffect(() => {
    // Carregar dados do usuário quando a página for montada
    if (user) {
      setPhone(user.phoneNumbers[0]?.phoneNumber || '');
      // Aqui você carregaria o endereço do usuário da sua API
    }
  }, [user]);

  const handleSaveProfile = async () => {
    // Lógica para salvar as alterações do perfil
    try {
      // Aqui você enviaria os dados atualizados para sua API
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar o perfil. Tente novamente.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-primary">Meu Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-primary">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback className="text-2xl sm:text-4xl">{user?.firstName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.primaryEmailAddress?.toString()}</p>
              <div className="mt-2">
                <Label htmlFor="phone" className="sr-only">Telefone</Label>
                <Input 
                  id="phone" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Seu telefone"
                  className="max-w-xs"
                />
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Endereço</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input 
                placeholder="Rua" 
                value={address.street} 
                onChange={(e) => setAddress({...address, street: e.target.value})}
              />
              <div className="flex gap-2">
                <Input 
                  placeholder="Número" 
                  value={address.number} 
                  onChange={(e) => setAddress({...address, number: e.target.value})}
                  className="w-1/3"
                />
                <Input 
                  placeholder="Complemento" 
                  value={address.complement} 
                  onChange={(e) => setAddress({...address, complement: e.target.value})}
                  className="w-2/3"
                />
              </div>
              <Input 
                placeholder="Bairro" 
                value={address.neighborhood} 
                onChange={(e) => setAddress({...address, neighborhood: e.target.value})}
              />
              <Input 
                placeholder="Cidade" 
                value={address.city} 
                onChange={(e) => setAddress({...address, city: e.target.value})}
              />
              <Input 
                placeholder="Estado" 
                value={address.state} 
                onChange={(e) => setAddress({...address, state: e.target.value})}
              />
              <Input 
                placeholder="CEP" 
                value={address.zipCode} 
                onChange={(e) => setAddress({...address, zipCode: e.target.value})}
              />
            </div>
          </div>

          <Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary-dark transition-colors">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
