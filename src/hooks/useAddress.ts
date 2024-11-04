import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiAlertTriangle } from 'react-icons/fi'
import { getCustomerOrCreate, updateCustomer, updateAddress, createAddressForCustomer } from "@/_actions/Customers"
import { Daum2, Attributes2 } from "../../types/customers-strape"

interface UseAddressProps {
  user: any
  selectedAddress: Daum2 | null
  setSelectedAddress: (address: Daum2 | null) => void
  addresses: Daum2[]
  setAddresses: (addresses: Daum2[]) => void
  newAddress: any
  setNewAddress: (address: any) => void
  setIsNewAddress: (value: boolean) => void
  setIsLoading: (value: boolean) => void
}

export const useAddress = ({
  user,
  selectedAddress,
  setSelectedAddress,
  addresses,
  setAddresses,
  newAddress,
  setNewAddress,
  setIsNewAddress,
  setIsLoading
}: UseAddressProps) => {
  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    if (selectedAddress) {
      setSelectedAddress({
        ...selectedAddress,
        attributes: {
          ...selectedAddress.attributes,
          [name]: value
        }
      })
    } else {
      setNewAddress((prev: any) => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('Por favor, faça login para salvar seu endereço.')
      return
    }

    try {
      if (selectedAddress) {
        await updateAddress(String(selectedAddress.id), {
          Nome: selectedAddress.attributes.Nome,
          Rua: selectedAddress.attributes.Rua,
          Cep: selectedAddress.attributes.Cep,
          Cidade: selectedAddress.attributes.Cidade,
          Bairro: selectedAddress.attributes.Bairro,
          Estado: selectedAddress.attributes.Estado,
        })
        
        toast.success('Endereço atualizado com sucesso!')
      } else {
     

        await createAddressForCustomer(String(user.emailAddresses[0]?.emailAddress), newAddress)
        toast.success('Novo endereço adicionado com sucesso!')
      }

      setSelectedAddress(null)
      setIsNewAddress(false)
      setNewAddress({
        Nome: '',
        Rua: '',
        Cep: '',
        Cidade: '',
        Bairro: '',
        Estado: '',
      })

      getUserAddress()

    } catch (error) {
      console.error('Erro ao salvar endereço:', error)
      toast.error('Erro ao salvar endereço. Tente novamente.')
    }
  }

  const getUserAddress = async () => {
    setIsLoading(true)
    const userData = {
      data: {
        first_name: user?.firstName,
        last_name: user?.lastName,
        email: user?.emailAddresses[0]?.emailAddress,
        phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',     
      }
    }
    
    try {
      const customerResponse = await getCustomerOrCreate(userData)
      const customerAddresses = customerResponse.attributes?.enderecos?.data || []
      setAddresses(customerAddresses)
      
      if (customerAddresses.length === 0) {
        toast.error("Nenhum endereço encontrado")
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar endereços')
    }
    setIsLoading(false)
  }

  return {
    handleNewAddressChange,
    handleAddressSubmit,
    getUserAddress
  }
}
