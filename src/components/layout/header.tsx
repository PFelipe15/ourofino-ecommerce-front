'use client'
import { ShoppingCart,  Search, Menu, Phone, Mail, HeadphonesIcon, ChevronDown, Diamond, BellRing, Shirt, DiamondIcon, PlusCircle, MapPin } from "lucide-react";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPinterest, FaRing } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { TbDiamonds, TbTruckDelivery } from "react-icons/tb";
import { useEffect, useState } from "react";
import { SignInButton, SignedIn, SignedOut, useClerk, useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { useCartStore } from '@/store/useCartStore';
import { Cart } from './cart/cart';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { User, LogOut, Gift, Heart, Truck, Clock } from "lucide-react";
import { SubmitAddress } from "@/_actions/submit-address";
import toast from 'react-hot-toast';
import { FiCheck, FiAlertTriangle, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import { getCustomerOrCreate, updateCustomer } from "@/_actions/Customers";
import { Category, getCategoriesAndCollections } from "@/_actions/Categories";
import { MdDiamond, MdGridGoldenratio } from "react-icons/md";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Daum2 } from "../../../types/customers-strape";
import { Attributes2 } from "../../../types/customers-strape";
 
   
const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: ''
  });
  const [isLoading, setIsLoading] = useState(false); // Adiciona estado para controle de loading
  const [categories, setCategories] = useState<Category[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [addresses, setAddresses] = useState<Daum2[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Daum2 | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    Nome: '',
    Rua: '',
    Cep: '',
    Cidade: '',
    Bairro: '',
    Estado: '',
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };
  
    window.addEventListener('scroll', handleScroll);
  
    // Limpeza do evento quando o componente for desmontado
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const fetchCategoriesAndCollections = async () => {
      const data = await getCategoriesAndCollections();
      setCategories(data);
    };

    fetchCategoriesAndCollections();
  }, []);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const { user } = useUser();
  const { signOut } = useClerk()

  const cartItems = useCartStore((state) => state.items);

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (selectedAddress) {
      // Se estiver editando um endereço existente
      setSelectedAddress({
        ...selectedAddress,
        attributes: {
          ...selectedAddress.attributes,
          [name]: value
        }
      });
    } else {
      // Se estiver criando um novo endereço
      setNewAddress(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Adicione esta função para salvar as alterações
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error('Por favor, faça login para salvar seu endereço.');
      return;
    }

    try {
      const addressData = selectedAddress ? selectedAddress.attributes : newAddress;
      
      // Encontre o índice do endereço sendo editado (se houver)
      const addressIndex = selectedAddress 
        ? addresses.findIndex(addr => addr.id === selectedAddress.id)
        : -1;

      // Crie uma cópia do array de endereços
      let updatedAddresses = [...addresses];

      if (addressIndex >= 0) {
        // Atualizar endereço existente
        updatedAddresses[addressIndex] = {
          ...updatedAddresses[addressIndex],
          attributes: addressData as Attributes2
        };
      } else {
        // Adicionar novo endereço
        updatedAddresses.push({
          id: Math.max(...addresses.map(a => a.id), 0) + 1,
          attributes: {
            ...addressData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString()
          } as Attributes2
        });
      }

      // Prepare os dados para atualização
      const userData = {
        data: {
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.emailAddresses[0]?.emailAddress,
          phone: user.phoneNumbers[0]?.phoneNumber || 'Não informado',
          enderecos: {
            data: updatedAddresses
          }
        }
      };
 
      // Atualize o cliente no Strapi
      await updateCustomer(String(user.id), userData);

      toast.success(
        selectedAddress ? 'Endereço atualizado com sucesso!' : 'Novo endereço adicionado com sucesso!'
      );

      // Limpe o formulário e atualize a lista
      setSelectedAddress(null);
      setIsNewAddress(false);
      setNewAddress({
        Nome: '',
        Rua: '',
        Cep: '',
        Cidade: '',
        Bairro: '',
        Estado: '',
      });

      // Recarregue os endereços
      getUserAddress();

    } catch (error) {
      console.error('Erro ao salvar endereço:', error);
      toast.error('Erro ao salvar endereço. Tente novamente.');
    }
  };

const getUserAddress = async () => {
  setIsLoading(true);  
  const userData = {
    data: {
      first_name: user?.firstName,
      last_name: user?.lastName,
      email: user?.emailAddresses[0]?.emailAddress,
      phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',     
    }
  }
  try {
    const customerResponse = await getCustomerOrCreate(userData);
    const customerAddresses = customerResponse.attributes?.enderecos?.data || [];
     setAddresses(customerAddresses);
    
    if (customerAddresses.length === 0) {
      toast.error(
        <div className="flex items-center">
          <FiAlertTriangle className="text-yellow-500 mr-2" size={20} />
          <div>
            <p className="font-bold">Nenhum endereço encontrado</p>
            <p className="text-sm">Você ainda não cadastrou nenhum endereço.</p>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error(error);
    toast.error('Erro ao carregar endereços');
  }
  setIsLoading(false);
}

  

  const handleAddressDialogOpen = () => {
    setIsAddressDialogOpen(true);
    getUserAddress(); // Chama a função ao abrir o modal
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'joias':
        return <MdDiamond size={16} className="mr-2" />;
      case 'aneis':
        return <FaRing size={16} className="mr-2" />;
      // Adicione mais casos conforme necessário
      case 'roupas':
        return <Shirt size={16} className="mr-2" />;
      default:
        return null;
    }
  };

   
  const MobileHeader = () => (
    <div className="flex items-center justify-between w-full py-4 px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
          <div className="flex flex-col h-full bg-gradient-to-b from-yellow-50 to-white">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-800 p-6 rounded-b-3xl shadow-lg">
              <Link href="/" className="flex items-center justify-center mb-6">
                <Image
                  src="/logotipoourofino.svg"
                  alt="Ouro Fino"
                  width={120}
                  height={40}
                  className="cursor-pointer filter brightness-0 invert"
                />
              </Link>
              <SignedIn>
                <div className="flex items-center space-x-3 text-white">
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-sm">{user?.fullName}</p>
                    <p className="text-xs opacity-80">{user?.primaryEmailAddress?.toString()}</p>
                  </div>
                </div>
              </SignedIn>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="space-y-6">
                <Link href="#novidades" className="block text-sm md:text-lg font-medium text-yellow-800 hover:text-yellow-600 transition-colors">
                  Novidades
                </Link>
                <Link href="#promocoes" className="block text-sm md:text-lg font-medium text-yellow-800 hover:text-yellow-600 transition-colors">
                  Promoções
                </Link>
                <div className="space-y-4">
                  <h3 className="text-sm md:text-lg font-semibold text-yellow-900">Categorias</h3>
                  <Accordion type="single" collapsible className="w-full">
                    {categories.map((category) => (
                      <AccordionItem key={category.id} value={category.name}>
                        <AccordionTrigger className="text-base text-yellow-800">
                          <div className="flex items-center">
                            {getCategoryIcon(category.name)}
                            <span className="text-sm md:text-base">{category.name}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 pl-6">
                            {category.collections.map((collection) => (
                              <li key={collection.id}>
                                <Link 
                                  href={`/produtos?categoria=${category.name}&colecao=${collection.slug}`}
                                  className="text-sm text-yellow-700 hover:text-yellow-500"
                                >
                                  {collection.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </nav>
            </div>
            <div className="mt-auto border-t border-yellow-200 p-4">
              <SignedIn>
                <Button variant="outline" className="w-full mb-2 text-yellow-800 border-yellow-600 hover:bg-yellow-50" onClick={handleAddressDialogOpen}>
                  <FiMapPin className="mr-2" />
                  Meu Endereço
                </Button>
                <Button variant="outline" className="w-full mb-2 text-yellow-800 border-yellow-600 hover:bg-yellow-50" onClick={() => signOut({ redirectUrl: '/' })}>
                  <LogOut className="mr-2" size={18} />
                  Sair
                </Button>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="secondary" className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
                    Entrar
                  </Button>
                </SignInButton>
              </SignedOut>
              <div className="flex justify-center space-x-4 mt-4">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-yellow-800 hover:text-yellow-600">
                  <FaInstagram size={24} />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-yellow-800 hover:text-yellow-600">
                  <FaFacebook size={24} />
                </a>
                <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className="text-yellow-800 hover:text-yellow-600">
                  <FaPinterest size={24} />
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/" className="flex-shrink-0">
        <Image
          src="/logotipoourofino.svg"
          alt="Ouro Fino"
          width={110}
          height={55}
          className="cursor-pointer"
        />
      </Link>

      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-yellow-800"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart size={24} />
          <AnimatePresence>
            {cartItems.length > 0 && (
              <motion.span
                key="cart-count"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {cartItems.length}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );

  const DesktopHeader = () => (
    <>
      {/* Top bar */}
      {!isScrolled && (
        <div className="bg-gray-100 text-gray-700 py-2">
          <div className="container mx-auto text-xs  flex flex-col md:flex-row justify-between items-center md:text-sm">
            <div className="flex space-x-4">
              <span className="flex items-center gap-2">
                <Phone size={16} className="text-primary" /> (86) 98803-4600
              </span>
              <span className="flex items-center gap-2">
                <Mail size={16} className="text-primary" /> contato@ourofino.com.br
              </span>
            </div>
            <div className="flex space-x-4 items-center mt-2 md:mt-0">
              <Link href="/quem-somos" className="hover:text-primary transition-all hover:scale-105">Quem Somos</Link>
              <Link href="/contato" className="hover:text-primary transition-all hover:scale-105">Contato</Link>
              <Link href="/faq" className="hover:text-primary transition-all hover:scale-105">FAQ</Link>
              <div className="flex space-x-2">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                  <FaInstagram size={18} />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                  <FaFacebook size={18} />
                </a>
                <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                  <FaPinterest size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <div className={`bg-white py-6 border-b border-gray-200 transition-all duration-300 ${isScrolled ? 'py-8' : ''}`}>
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <Link href="/" className="flex-shrink-0 my-4 md:my-0">
            <Image
              src="/logotipoourofino.svg"
              alt="Ouro Fino"
              width={isScrolled ? 150 : 200}
              height={isScrolled ? 52 : 70}
              className="cursor-pointer transition-all duration-300"
            />
          </Link>

          <div className="flex-1 px-4 md:px-8">
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full focus:outline-none focus:border-primary transition-all"
                placeholder="Buscar produtos..."
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 mt-2 md:mt-0">
            <Button 
              variant="ghost"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-all"
            >
              <Gift size={20} />
              <span className="hidden md:inline">Presentes</span>
            </Button>

            <a 
              href="/produtos?favoritos=true"     
              className="flex items-center p-2 rounded-md gap-2 text-gray-600 hover:text-primary transition-all hover:bg-accent"
            >
              <Heart size={20} />
              <span className="hidden md:inline">Favoritos</span>
            </a>

            <SignedIn>
              <Popover>
                <PopoverTrigger>
                  <Avatar className="cursor-pointer transition-transform hover:scale-105 ring-2 ring-primary ring-offset-2">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </PopoverTrigger>
                <PopoverContent className="w-[350px] p-2 rounded-lg shadow-xl border border-gray-200">
                  <div className="flex flex-col">
                    <div className="bg-gradient-to-r from-primary to-yellow-700 p-4 rounded-t-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-12 h-12 border-2 border-white">
                          <AvatarImage src={user?.imageUrl} />
                          <AvatarFallback>{user?.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-white">
                          <p className="font-semibold text-lg">{user?.fullName}</p>
                          <p className="text-sm opacity-80">{user?.primaryEmailAddress?.toString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link href="/meus-pedidos" className="flex items-center justify-start space-x-2 text-gray-700   hover:bg-primary w-full px-3 py-2 rounded-md transition-all hover:text-white">
                        <span className="text-base">Meus Pedidos</span>
                      </Link>
                      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" className="flex items-center justify-start space-x-2 text-gray-700   w-full px-3 py-2 rounded-md transition-all hover:bg-primary hover:text-white" onClick={handleAddressDialogOpen}>
                            <span className="text-base">Meu Endereço</span>
                          </Button>
                        </DialogTrigger>
                        {/* ... conteúdo do DialogContent ... */}
                      </Dialog>
                      <hr className="my-2 border-gray-200" />
                      <Button variant="ghost" className="flex items-center justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-full px-3 py-2 rounded-md transition-all" onClick={() => signOut({ redirectUrl: '/' })}>
                        <LogOut size={18} />
                        <span>Sair</span>
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all hover:scale-105 px-4 py-2 rounded-full font-semibold"
                >
                  <User size={20} /> Entrar
                </Button>
              </SignInButton>
            </SignedOut>

            <Button
              variant="ghost"
              className="relative p-2 rounded-full text-primary hover:bg-primary/10 transition-all hover:scale-110"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={28} />
              <AnimatePresence>
                {cartItems.length > 0 && (
                  <motion.span
                    key="cart-count"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {cartItems.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation bar */}
      {!isScrolled && (
        <nav className="bg-gray-50 ">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">   
            <div className="flex flex-row items-center space-y-0 md:space-x-6">
              <Link href="#novidades" className="text-gray-600 hover:text-primary transition-all px-3 py-2">Novidades</Link>
              <Link href="#promocoes" className="text-gray-600 hover:text-primary transition-all px-3 py-2">Promoções</Link>
              
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-primary transition-all px-3 py-2">
                  Categorias
                  <ChevronDown size={16} className="ml-1 group-hover:transform group-hover:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute left-0 top-full pt-2 w-screen md:w-auto">
                  <div className="w-full md:w-[600px] rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block transition-all duration-200 opacity-0 group-hover:opacity-100">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((category) => (
                        <div key={category.id} className="space-y-2">
                          <Link href={`/produtos?categoria=${category.name}`} className="font-semibold text-lg text-gray-800 hover:text-primary flex items-center">
                            {getCategoryIcon(category.name)}
                            <span>{category.name}</span>
                          </Link>
                          <ul className="space-y-1 pl-6 border-l-2 border-gray-200">
                            {category.collections.map((collection) => (
                              <li key={collection.id}>
                                <Link 
                                  href={`/produtos?categoria=${category.name}&colecao=${collection.slug}`} 
                                  className="text-sm text-gray-600 hover:text-primary hover:underline flex items-center"
                                >
                                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                                  {collection.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-b-md">
                      <Link href="/produtos" className="text-primary hover:underline text-sm font-medium">
                        Ver todas as categorias
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs mb-2 md:text-sm mt-4 md:mt-0">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={16} className="text-primary" /> Frete grátis acima de R$299
              </span>
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-primary" /> Entrega em 24h
              </span>
            </div>
          </div>
        </nav>
      )}

      {/* Promo Bar */}
      {!isScrolled && (
        <motion.div
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="bg-primary text-center font-bold py-3 hidden md:block text-white text-sm"
        >
          <span className="flex items-center justify-center gap-2">
            <TbTruckDelivery size={20} /> Na primeira compra ganhe 5% OFF usando cupom: PRIMEIRACOMPRA
          </span>
        </motion.div>
      )}
    </>
  );

  return (
    <header className={`w-screen sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      {isMobile ? <MobileHeader /> : <DesktopHeader />}

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      
      {/* Dialog para endereço */}
      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              Meus Endereços
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Gerencie seus endereços de entrega
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <span className="text-primary">Carregando...</span>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Lista de endereços */}
              <div className="grid grid-cols-1 gap-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-4 rounded-lg border border-gray-100 hover:border-primary/20 transition-all bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-gray-900">
                            {address.attributes.Nome}
                          </h3>
                          {/* Tag de endereço principal (opcional) */}
                          {address.id === 1 && (
                            <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">
                          {address.attributes.Rua}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {address.attributes.Bairro}, {address.attributes.Cidade} - {address.attributes.Estado}
                        </p>
                        <p className="text-gray-500 text-sm">
                          CEP: {address.attributes.Cep}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedAddress(address)}
                        className="hover:bg-primary/10 text-primary"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão adicionar novo endereço */}
              <Button
                onClick={() => setIsNewAddress(true)}
                variant="outline"
                className="w-full mt-4 border-dashed border-2 hover:border-primary hover:bg-primary/5 text-gray-600 hover:text-primary h-12"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Adicionar novo endereço
              </Button>

              {/* Formulário para novo endereço ou edição */}
              {(isNewAddress || selectedAddress) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
                    <h3 className="text-lg font-semibold mb-4">
                      {selectedAddress ? 'Editar Endereço' : 'Novo Endereço'}
                    </h3>
                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="Nome" className="text-gray-700">Nome do endereço</Label>
                          <Input
                            id="Nome"
                            name="Nome"
                            value={selectedAddress ? selectedAddress.attributes.Nome : newAddress.Nome}
                            onChange={handleNewAddressChange}
                            placeholder="Ex: Casa, Trabalho"
                            className="mt-1"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="Cep" className="text-gray-700">CEP</Label>
                            <Input
                              id="Cep"
                              name="Cep"
                              value={selectedAddress ? selectedAddress.attributes.Cep : newAddress.Cep}
                              onChange={handleNewAddressChange}
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="Rua" className="text-gray-700">Rua</Label>
                            <Input
                              id="Rua"
                              name="Rua"
                              value={selectedAddress ? selectedAddress.attributes.Rua : newAddress.Rua}
                              onChange={handleNewAddressChange}
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="Bairro" className="text-gray-700">Bairro</Label>
                            <Input
                              id="Bairro"
                              name="Bairro"
                              value={selectedAddress ? selectedAddress.attributes.Bairro : newAddress.Bairro}
                              onChange={handleNewAddressChange}
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="Cidade" className="text-gray-700">Cidade</Label>
                            <Input
                              id="Cidade"
                              name="Cidade"
                              value={selectedAddress ? selectedAddress.attributes.Cidade : newAddress.Cidade}
                              onChange={handleNewAddressChange}
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="Estado" className="text-gray-700">Estado</Label>
                          <Input
                            id="Estado"
                            name="Estado"
                            value={selectedAddress ? selectedAddress.attributes.Estado : newAddress.Estado}
                            onChange={handleNewAddressChange}
                            className="mt-1"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsNewAddress(false);
                            setSelectedAddress(null);
                          }}
                          className="w-full sm:w-auto"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit"
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                        >
                          {selectedAddress ? 'Atualizar' : 'Adicionar'} endereço
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;
