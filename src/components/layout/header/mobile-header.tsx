'use client'

import { Menu, ShoppingCart } from "lucide-react"
import { FaFacebook, FaInstagram, FaPinterest, FaRing } from "react-icons/fa"
import { FiMapPin } from "react-icons/fi"
import { MdDiamond } from "react-icons/md"
import { Shirt, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MobileHeaderProps {
  user: any
  categories: any[]
  cartItems: any[]
  isCartOpen: boolean
  setIsCartOpen: (value: boolean) => void
  onAddressClick: () => void
  signOut?: any
}

export const MobileHeader = ({
  user,
  categories,
  cartItems,
  isCartOpen,
  setIsCartOpen,
  onAddressClick,
  signOut
}: MobileHeaderProps) => {
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
    <div className="flex items-center justify-between w-full py-4 px-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[80vw] sm:w-[350px] p-0">
          <div className="flex flex-col h-full bg-gradient-to-b from-yellow-50 to-white">
            {/* Cabeçalho do Menu */}
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

            {/* Menu de Navegação */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <nav className="space-y-6">
                <Link 
                  href="#novidades" 
                  className="block text-sm md:text-lg font-medium text-yellow-800 hover:text-yellow-600 transition-colors"
                >
                  Novidades
                </Link>
                <Link 
                  href="#promocoes" 
                  className="block text-sm md:text-lg font-medium text-yellow-800 hover:text-yellow-600 transition-colors"
                >
                  Promoções
                </Link>

                {/* Menu de Categorias */}
                <div className="space-y-4">
                  <h3 className="text-sm md:text-lg font-semibold text-yellow-900">
                    Categorias
                  </h3>
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
                            {category.collections.map((collection: any) => (
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

            {/* Rodapé do Menu */}
            <div className="mt-auto border-t border-yellow-200 p-4">
              <SignedIn>
                <Button 
                  variant="outline" 
                  className="w-full mb-2 text-yellow-800 border-yellow-600 hover:bg-yellow-50" 
                  onClick={onAddressClick}
                >
                  <FiMapPin className="mr-2" />
                  Meu Endereço
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mb-2 text-yellow-800 border-yellow-600 hover:bg-yellow-50" 
                  onClick={() => signOut?.({ redirectUrl: '/' })}
                >
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

              {/* Redes Sociais */}
              <div className="flex justify-center space-x-4 mt-4">
                <a 
                  href="https://www.instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-yellow-800 hover:text-yellow-600"
                >
                  <FaInstagram size={24} />
                </a>
                <a 
                  href="https://www.facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-yellow-800 hover:text-yellow-600"
                >
                  <FaFacebook size={24} />
                </a>
                <a 
                  href="https://www.pinterest.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-yellow-800 hover:text-yellow-600"
                >
                  <FaPinterest size={24} />
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo */}
      <Link href="/" className="flex-shrink-0">
        <Image
          src="/logotipoourofino.svg"
          alt="Ouro Fino"
          width={110}
          height={55}
          className="cursor-pointer"
        />
      </Link>

      {/* Carrinho */}
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
  )
}
