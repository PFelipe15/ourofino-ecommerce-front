'use client'

import { MapPin, PlusCircle, Trash2 } from "lucide-react"
import { Daum2 } from "../../../../types/customers-strape"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface AddressDialogProps {
  isOpen: boolean
  onClose: () => void
  addresses: Daum2[]
  selectedAddress: Daum2 | null
  setSelectedAddress: (address: Daum2 | null) => void
  isNewAddress: boolean
  setIsNewAddress: (value: boolean) => void
  isLoading: boolean
  newAddress: {
    Nome: string
    Rua: string
    Cep: string
    Cidade: string
    Bairro: string
    Estado: string
  }
  handleNewAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleAddressSubmit: (e: React.FormEvent) => void
  handleDeleteAddress: (addressId: number) => void
}

export const AddressDialog = ({
  isOpen,
  onClose,
  addresses,
  selectedAddress,
  setSelectedAddress,
  isNewAddress,
  setIsNewAddress,
  isLoading,
  newAddress,
  handleNewAddressChange,
  handleAddressSubmit,
  handleDeleteAddress
}: AddressDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] bg-white p-0 rounded-lg overflow-hidden max-h-[90vh]">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 p-3 sm:p-6">
          <DialogHeader className="flex flex-col items-center space-y-1 sm:space-y-2">
            <Image
              src="/logotipoourofino.svg"
              alt="Ourofino Logo"
              width={150}
              height={75}
              className="mb-1 sm:mb-4 p-1 sm:p-4 filter brightness-0 invert"
            />
            <DialogTitle className="text-lg sm:text-2xl font-bold text-white text-center">
              {isNewAddress || selectedAddress ? 
                `${selectedAddress ? 'Editar' : 'Novo'} Endereço` : 
                'Meus Endereços'
              }
            </DialogTitle>
            <DialogDescription className="text-center text-yellow-100 text-xs sm:text-sm">
              {isNewAddress || selectedAddress ? 
                'Preencha os dados do endereço' : 
                'Gerencie seus endereços de entrega'
              }
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {(isNewAddress || selectedAddress) ? (
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsNewAddress(false)
                    setSelectedAddress(null)
                  }}
                  className="w-full sm:w-auto rounded-full px-6"
                >
                  Voltar
                </Button>
                <Button 
                  type="submit"
                  className="w-full sm:w-auto rounded-full px-6 bg-primary hover:bg-yellow-800 hover:scale-105 transition-all"
                >
                  {selectedAddress ? 'Atualizar' : 'Adicionar'} endereço
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-3 sm:p-4 rounded-xl border hover:border-primary/20 transition-all bg-white hover:shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {address.attributes.Nome}
                          </h3>
                          {address.id === 1 && (
                            <span className="px-2.5 py-0.5 text-xs bg-primary/5 text-primary rounded-full font-medium">
                              Principal
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {address.attributes.Rua}<br />
                          {address.attributes.Bairro}, {address.attributes.Cidade} - {address.attributes.Estado}<br />
                          CEP: {address.attributes.Cep}
                        </p>
                      </div>
                      <div className="flex w-full sm:w-auto justify-end gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedAddress(address)}
                          className="flex-1 sm:flex-none justify-center hover:bg-primary/5 text-gray-600 hover:text-primary rounded-full h-8 sm:h-9 px-2 sm:px-4"
                        >
                          <MapPin className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                          className="flex-1 sm:flex-none justify-center hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full h-8 sm:h-9 px-2 sm:px-4"
                        >
                          <Trash2 className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Apagar</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {addresses.length < 3 ? (
                <Button
                  onClick={() => setIsNewAddress(true)}
                  variant="outline"
                  className="w-full mt-6 border-dashed border-2 hover:border-primary hover:bg-primary/5 text-gray-500 hover:text-primary h-12 rounded-xl transition-colors duration-200"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Adicionar novo endereço
                </Button>
              ) : (
                <p className="text-sm text-gray-500 text-center mt-4 sm:mt-6">
                  Limite máximo de 3 endereços atingido
                </p>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
