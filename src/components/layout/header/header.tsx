'use client'

import { useEffect, useState } from "react"
import { useUser, useClerk } from "@clerk/nextjs"
import { useCartStore } from '@/store/useCartStore'
 

import { MobileHeader } from "./mobile-header"
import { DesktopHeader } from "./desktop-header"
import { AddressDialog } from "./address-dialog"
import { Cart } from '../cart/cart'
import { useAddress } from "@/hooks/useAddress"
import { Category, getCategoriesAndCollections } from "@/_actions/Categories"
import { Daum2 } from "../../../../types/customers-strape"

export const Header = () => {
  // Estados principais
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isMobile, setIsMobile] = useState(false)
  
  // Estados relacionados a endereço
  const [isLoading, setIsLoading] = useState(false)
  const [addresses, setAddresses] = useState<Daum2[]>([])
  const [selectedAddress, setSelectedAddress] = useState<Daum2 | null>(null)
  const [isNewAddress, setIsNewAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    Nome: '',
    Rua: '',
    Cep: '',
    Cidade: '',
    Bairro: '',
    Estado: '',
  })

  // Hooks
  const { user } = useUser()
  const { signOut } = useClerk()
  const cartItems = useCartStore((state) => state.items)
  const { handleNewAddressChange, handleAddressSubmit, getUserAddress } = useAddress({
    user,
    selectedAddress,
    setSelectedAddress,
    addresses,
    setAddresses,
    newAddress,
    setNewAddress,
    setIsNewAddress,
    setIsLoading
  })

  // Effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategoriesAndCollections()
      setCategories(data)
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])

  // Handlers
  const handleAddressDialogOpen = () => {
    setIsAddressDialogOpen(true)
    getUserAddress()
  }

  return (
    <header className={`w-screen sticky top-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
    }`}>
      {isMobile ? (
        <MobileHeader 
          user={user}
          categories={categories}
          cartItems={cartItems}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          onAddressClick={handleAddressDialogOpen}
          signOut={signOut}
        />
      ) : (
        <DesktopHeader 
          user={user}
          categories={categories}
          cartItems={cartItems}
          isScrolled={isScrolled}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          onAddressClick={handleAddressDialogOpen}
          signOut={signOut}
          isAddressDialogOpen={isAddressDialogOpen}
          setIsAddressDialogOpen={setIsAddressDialogOpen}
        />
      )}

      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
      
      <AddressDialog 
        isOpen={isAddressDialogOpen}
        onClose={() => setIsAddressDialogOpen(false)}
        addresses={addresses}
        handleDeleteAddress={()=>{
          console.log('delete')
        }}
        selectedAddress={selectedAddress}
        setSelectedAddress={setSelectedAddress}
        isNewAddress={isNewAddress}
        setIsNewAddress={setIsNewAddress}
        isLoading={isLoading}
        newAddress={newAddress}
        handleNewAddressChange={handleNewAddressChange}
        handleAddressSubmit={handleAddressSubmit}
      />
    </header>
  )
}

export default Header