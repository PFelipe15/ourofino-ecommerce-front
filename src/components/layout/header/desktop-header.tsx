'use client'

import { ShoppingCart, Search, Phone, Mail, ChevronDown, Gift, Heart, Truck, Clock, LogOut } from "lucide-react"
import { FaFacebook, FaInstagram, FaPinterest, FaRing, FaUser } from "react-icons/fa"
import { TbTruckDelivery } from "react-icons/tb"
import { MdDiamond } from "react-icons/md"
import { Shirt } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"

interface DesktopHeaderProps {
  user: any
  categories: any[]
  cartItems: any[]
  isScrolled: boolean
  isCartOpen: boolean
  setIsCartOpen: (value: boolean) => void
  onAddressClick: () => void
  signOut?: any
  isAddressDialogOpen?: boolean
  setIsAddressDialogOpen?: (value: boolean) => void
}

export const DesktopHeader = ({
  user,
  categories,
  cartItems,
  isScrolled,
  isCartOpen,
  setIsCartOpen,
  onAddressClick,
  signOut,
  isAddressDialogOpen,
  setIsAddressDialogOpen
}: DesktopHeaderProps) => {
  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'joias':
        return <MdDiamond size={16} className="mr-2" />
      case 'aneis':
        return <FaRing size={16} className="mr-2" />
      case 'roupas':
        return <Shirt size={16} className="mr-2" />
      default:
        return null
    }
  }

  return (
    <>
      {/* Top Bar */}
      {!isScrolled && (
        <div className="bg-gray-100 text-gray-700 py-2">
          <div className="container mx-auto text-xs flex flex-col md:flex-row justify-between items-center md:text-sm">
            <div className="flex space-x-4">
              <span className="flex items-center gap-2">
                <Phone size={16} className="text-primary" /> (86) 98803-4600
              </span>
              <span className="flex items-center gap-2">
                <Mail size={16} className="text-primary" /> contato@ourofino.com.br
              </span>
            </div>
            <div className="flex space-x-4 items-center mt-2 md:mt-0">
              <Link href="/quem-somos" className="hover:text-primary transition-all hover:scale-105">
                Quem Somos
              </Link>
              <Link href="/contato" className="hover:text-primary transition-all hover:scale-105">
                Contato
              </Link>
              <Link href="/faq" className="hover:text-primary transition-all hover:scale-105">
                FAQ
              </Link>
              <div className="flex space-x-2">
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" 
                   className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                  <FaInstagram size={18} />
                </a>
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
                   className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                  <FaFacebook size={18} />
                </a>
                <a href="https://www.pinterest.com" target="_blank" rel="noopener noreferrer"
                   className="text-primary hover:text-primary/80 transition-all hover:scale-110">
                  <FaPinterest size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
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
                      <Link href="/meus-pedidos" className="flex items-center justify-start font-semibold space-x-2 text-gray-700 hover:bg-primary w-full px-3 py-2 rounded-md transition-all hover:text-white">
                        <span className="text-base">Meus Pedidos</span>
                      </Link>
                      <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="flex items-center justify-start space-x-2 text-gray-700 w-full px-3 py-2 rounded-md transition-all hover:bg-primary hover:text-white" 
                            onClick={onAddressClick}
                          >
                            <span className="text-base">Meu Endereço</span>
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                      <hr className="my-2 border-gray-200" />
                      <Button 
                        variant="ghost" 
                        className="flex items-center justify-start space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50 w-full px-3 py-2 rounded-md transition-all" 
                        onClick={() => signOut?.({ redirectUrl: '/' })}
                      >
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
                  className="
                    flex items-center gap-2 
                    bg-gradient-to-r from-yellow-600 to-yellow-700
                    hover:from-yellow-700 hover:to-yellow-800
                    text-white font-semibold
                    px-6 py-2.5
                    rounded-lg
                    shadow-lg hover:shadow-xl
                    transform  
                    transition-all duration-200
                    border border-yellow-600
                    group
                  "
                >
                  <FaUser size={18} className="animate-pulse" />
                  <span className="relative">
                    Entrar
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white/40 transform scale-x-0 transition-transform group-hover:scale-x-100"></span>
                  </span>
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

      {/* Navigation Bar */}
      {!isScrolled && (
        <nav className="bg-gray-50">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">   
            <div className="flex flex-row items-center space-y-0 md:space-x-6">
              <Link href="#novidades" className="text-gray-600 hover:text-primary transition-all px-3 py-2">
                Novidades
              </Link>
              <Link href="#promocoes" className="text-gray-600 hover:text-primary transition-all px-3 py-2">
                Promoções
              </Link>
              
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
                          <Link 
                            href={`/produtos?categoria=${category.name}`} 
                            className="font-semibold text-lg text-gray-800 hover:text-primary flex items-center"
                          >
                            {getCategoryIcon(category.name)}
                            <span>{category.name}</span>
                          </Link>
                          <ul className="space-y-1 pl-6 border-l-2 border-gray-200">
                            {category.collections.map((collection: any) => (
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
  )
}