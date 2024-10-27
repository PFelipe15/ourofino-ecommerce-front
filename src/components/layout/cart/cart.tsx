'use client'
import { useCartStore } from '@/store/useCartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Store, Truck, ShoppingBag,   ArrowLeft, Package, Bell, User, CheckCircle, Minus, Plus, Trash2,   } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { SignInButton, useUser } from '@clerk/nextjs'
import { useToast } from '@/hooks/use-toast'
import { Button } from '../../ui/button'
import { Order, UserOrders   } from './UserOrders'
import { UserAddress } from './UserAddress/UserAddress' // Importa o novo componente UserAddress
import { getCustomerOrCreate } from '@/_actions/Customers'
 import {payOrder} from '@/_actions/Orders'
import Image from 'next/image'
import {createOrder, createItemsOrder} from '@/_actions/Orders'
 import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'; // Certifique-se de importar o componente Carousel
import { Card, CardContent } from "@/components/ui/card";
 import { PaymentMethod } from './PaymentMethod'
import { OrderSummary } from './OrderSummary';
import { StepGuide } from './UserAddress/StepGuide'
import { Tooltip, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TooltipContent } from '@/components/ui/tooltip'
import { ThankYouMessage } from './ThankYouMessage'
import { getPaymentMethods } from '@/_actions/MetodosPagamento'
import { MetodosPagamento } from '../../../../types/metodos_pagamento'
 import qs from 'qs'
import { getProductsByFilter } from '@/_actions/Products'
import { ProductsData } from '../../../../types/product-all-strape'
import toast from 'react-hot-toast';

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, resetStep, removeItem, clearCart, increaseQuantity, decreaseQuantity, step, setStep } = useCartStore()
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'BR'
  })
  const { user, isSignedIn } = useUser()
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [showOpenOrders, setShowOpenOrders] = useState(false)
  const [hasNewOrders, setHasNewOrders] = useState(true)
  const [cpf, setCpf] = useState('')
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [userAddress, setUserAddress] = useState<any>(null)
  const [useSavedAddress, setUseSavedAddress] = useState(false)
  const [isAddressModified, setIsAddressModified] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<any[]>([])
  const [showThankYouMessage, setShowThankYouMessage] = useState(false)
  const [selectedShippingCost, setSelectedShippingCost] = useState<number | null>(null)
  const [pickupInStore, setPickupInStore] = useState(false)
  const [pickupDetails, setPickupDetails] = useState({
    name: '',
    document: ''
  })
  const [authorizedPeople, setAuthorizedPeople] = useState<any[]>([])
  const [deliveryMethod, setDeliveryMethod] = useState<string>('saved')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [shippingOption, setShippingOption] = useState<any>(null)
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false)
  const [purchaseCompleted, setPurchaseCompleted] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<MetodosPagamento[]>([])
  const [productsCartShowcase, setProductsCartShowcase] = useState<ProductsData[]>([])
  const total = items.reduce((sum, item) => sum + (item?.price || 0) * item.quantity, 0) + (selectedShippingCost || 0)
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchUserAddress = async () => {
      if (user) {
        setIsLoadingAddress(true)
        const userData = {
          data: {
            first_name: user?.firstName,
            last_name: user?.lastName,
            email: user?.emailAddresses[0]?.emailAddress,
            phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',
            cpf: cpf,
            address: address
          }
        }
        const customerResponse = await getCustomerOrCreate(userData)
        const customerAddress = customerResponse.attributes.address

        if (customerAddress) {
          setUserAddress(customerAddress)
          setAddress(customerAddress)
        } else {
          setUserAddress(null)
        }
        setIsLoadingAddress(false)
      }
    }
    fetchUserAddress()
  }, [user])
 
  useEffect(() => {
    const savedPeople = localStorage.getItem('authorizedPeople')
    if (savedPeople) {
      setAuthorizedPeople(JSON.parse(savedPeople))
    }
  }, [])

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const methods = await getPaymentMethods()
        setPaymentMethods(methods)
      } catch (error) {
        console.error('Erro ao buscar métodos de pagamento:', error)
        toast.error('Não foi possível carregar os métodos de pagamento.')
      }
    }

    fetchPaymentMethods()
  }, [])


useEffect(() => {
  const fetchProductsCartShowcase = async () => {
  const query = qs.stringify(
    {
      filters: {
        destaque_vitrine: {
          $eq: true,
          },
        },
      },
      {
        encodeValuesOnly: true,
      }
    );

    const productsCartShowcase = await getProductsByFilter(query)
    setProductsCartShowcase(productsCartShowcase)
   }
  fetchProductsCartShowcase()
   },[])

  // Modifique a função nextStep para incluir uma verificação
  const nextStep = () => {
    const newStep = Math.min(step + 1, 3)
    setStep(newStep)
  }

  // Modifique a função prevStep para incluir uma verificação
  const prevStep = () => {
    const newStep = Math.max(step - 1, 0)
    setStep(newStep)
  }

  // Modifique a função onClose para resetar o step quando o carrinho for fechado
  const handleClose = () => {
    onClose()
  }

  const handleConfirmPurchase = async () => {
    if (!isSignedIn) {
      toast.error(
        (t) => (
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">Ação não permitida</span>
            <p className="mt-1 text-sm text-gray-500">Por favor, faça login para finalizar sua compra.</p>
            <SignInButton mode='modal'>
              <Button 
                variant="outline" 
                className="mt-3 flex items-center gap-2 bg-primary text-white hover:bg-primary-dark transition-all duration-300 px-4 py-2 rounded-md font-semibold text-sm"
                onClick={() => toast.dismiss(t.id)}
              >
                <User size={16} /> Entrar
              </Button>
            </SignInButton>
          </div>
        ),
        {
          duration: 5000,
          style: {
            background: '#fff',
            color: '#333',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          icon: '🔒',
        }
      );
      return;
    }

    const purchasePromise = new Promise(async (resolve, reject) => {
      setIsProcessingPurchase(true);
      try {
        const serializedUser = createSerializedUser();
        const customer = await getCustomerOrCreate(serializedUser);
        const { id, sandbox_init_point } = await processPayment();
        const orderData = createOrderData(customer.id, sandbox_init_point, id);
        await createOrderAndItems(orderData);

        setShowThankYouMessage(true);
        clearCart();
        setPurchaseCompleted(true);

        setTimeout(() => {
          window.open(orderData.link_payment, '_blank');
        }, 2000);

        resolve(orderData);
      } catch (error) {
        reject(error);
      } finally {
        setIsProcessingPurchase(false);
      }
    });

    toast.promise(
      purchasePromise,
      {
        loading: 'Processando sua compra...',
        success: 'Pedido confirmado com sucesso! Redirecionando para o pagamento...',
        error: 'Erro ao processar o pagamento. Por favor, tente novamente.',
      },
      {
        style: {
          minWidth: '250px',
        },
        success: {
          duration: 5000,
          icon: '🎉',
        },
        error: {
          duration: 5000,
          icon: '❌',
        },
      }
    );
  };

  const createSerializedUser = () => ({
    data: {
      first_name: user?.firstName,
      last_name: user?.lastName,
      email: user?.emailAddresses[0]?.emailAddress,
      phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',
      cpf: cpf,
      address: address
    }
  })

  const processPayment = async () => {
    try {
      if(items.length === 0) {
        toast.error('Carrinho vazio', {
          duration: 3000,
          position: 'top-center',
          icon: '🛒',
        });
      }

      const args = {
        items: items,
        user: {
          data: {
            first_name: user?.firstName,
            last_name: user?.lastName,
            email: user?.emailAddresses[0]?.emailAddress,
            phone: user?.phoneNumbers[0]?.phoneNumber || 'Não informado',
            address: address          
          }
        },
        total: total,
        shipmentCost: selectedShippingCost ?? 0, // Corrigido para garantir que seja um número
        paymentMethod: paymentMethod
      }

      return await payOrder(args)
    } catch (error) {
      console.error('Erro ao processar o pagamento:', error)
      throw error
    }
  }

  const createOrderData = (customerId: number, sandbox_init_point: string | undefined, id: string | undefined) => ({
    customer: {
      connect: [customerId]
    },
    status: 'pending' as 'pending',
    order_date: Date.now(),
    total: total,
    total_frete: selectedShippingCost,
    transportadora_id: 1,
    endereco_entrega: JSON.stringify(address),
    link_payment: sandbox_init_point,
    payment_id: id
  })

  const handleAddToCart = (product: ProductsData, quantity: number, price: number, selectedSize?: string) => {
    addItem(product, quantity, price, selectedSize);
    toast.success(`${product.attributes.name} foi adicionado ao seu carrinho.`, {
      duration: 3000,
      icon: '🛍️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const createOrderAndItems = async (orderData: any) => {
    try {
      const responseCreateOrder = await createOrder(orderData)
      await createItemsOrder(items, responseCreateOrder.data.id)
    } catch (error) {
      toast.error('Erro ao criar o pedido e seus itens. Por favor, verifique os dados e tente novamente.', {
        duration: 4000,
        icon: '❌',
        style: {
          borderRadius: '10px',
          background: '#FEE2E2',
          color: '#991B1B',
          border: '1px solid #F87171',
        },
      });
      console.error('Erro ao criar o pedido:', error);
    }
  }

  
  const containerVariants = {
    hidden: { opacity: 0, x: '100%' },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 120 } },
    exit: { opacity: 0, x: '100%', transition: { ease: 'easeInOut' } }
  }

  const renderStep = () => {
    if (purchaseCompleted) {
      return <ThankYouMessage setShowOpenOrders={() => setShowOpenOrders(true)} onClose={() => {
        setPurchaseCompleted(false)
        resetStep()
        onClose()
      }} />
    }

    if (showOpenOrders) {
      return <UserOrders onClose={() => setShowOpenOrders(false)} />
    }

    switch (step) {
      case 0:
        return (
          <>            
            {renderCartItems()}
          </>
        )
      case 1:
        return <UserAddress onNext={(method, addressData, shipping) => {
          setDeliveryMethod(method)
          setAddress(addressData)
          setShippingOption(shipping)  // Atualize o shippingOption aqui
          nextStep()
        }} onPrevious={prevStep} />
      case 2:
        return <PaymentMethod 
          onNext={(method) => {
            setPaymentMethod(method)
            nextStep()
          }} 
          onPrevious={prevStep}
          availableMethods={paymentMethods}
        />
      case 3:
        return (
          <OrderSummary
            onConfirm={handleConfirmPurchase}
            onPrevious={prevStep}
            deliveryMethod={deliveryMethod}
            address={address}
            pickupDetails={pickupDetails}
            paymentMethod={paymentMethod}
            shippingOption={shippingOption}  // Passe o shippingOption aqui
            customerName={user?.fullName || ''}
            customerEmail={user?.emailAddresses[0]?.emailAddress || ''}
            isProcessingPurchase={isProcessingPurchase}
            isSignedIn={isSignedIn}
          />
        )
      default:
        return null
    }
  }

  

  const renderCartShowcase = () => {
    return (
      <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow-inner">
        <h3 className="text-sm md:text-lg  font-bold text-yellow-800 mb-3 text-center">Destaques da Vitrine</h3>
        <Carousel className="w-full relative">
          <CarouselContent>
            {productsCartShowcase.map((produto, index) => (
              <CarouselItem key={index}>
                <Card className="bg-white border-2 border-yellow-200 shadow-md rounded-lg overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 md:w-24 h-20 md:h-24 flex-shrink-0">
                        <Image
                          src={produto.attributes.images.data[0].attributes.url}
                          alt={produto.attributes.name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-md"
                        />
                        <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-bl-md">
                          Novo
                        </div>
                      </div>
                      <div className="flex-1">
                          <h4 className="font-semibold text-sm md:text-base text-gray-800 mb-1 line-clamp-2">{produto.attributes.name}</h4>
                          <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-1">{produto.attributes.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-md md:text-lg font-bold text-yellow-600">R$ {produto.attributes.price_primary ?? 0}</span>
                          <Button size="sm" onClick={() => handleAddToCart(produto, 1, produto.attributes.price_primary ?? 0)} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-md px-4 py-1 text-sm transition-all duration-300 ease-in-out transform hover:scale-105">
                            Adicionar 
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md border-2 border-yellow-300 rounded-full p-2 hover:bg-yellow-50" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md border-2 border-yellow-300 rounded-full p-2 hover:bg-yellow-50" />
        </Carousel>
      </div>
    );
  };

  
  const renderCartItems = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="     relative   flex flex-col gap-2 justify-between  "
      >
         
        {items.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">Seu carrinho está vazio.</p>
        ) : (
          items.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b bg-white shadow-md rounded-lg p-3">
              <div className="flex items-center space-x-3">
                <Image
                  src={item?.attributes?.images.data[0]?.attributes.url}
                  alt={item?.attributes?.name}
                  width={70}
                  height={70}
                  className="rounded-md"
                />
                <div className="flex flex-col">
                  <p className="font-semibold text-sm md:text-lg text-gray-800">{item?.attributes?.name || 'Produto Indisponível'}</p>
                  {item.selectedSize && <p className="text-xs md:text-base text-gray-600">Tamanho: {item.selectedSize}</p>}
                  <p className="text-xs md:text-base text-gray-600">Preço Unitário: R$ {item.price?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-semibold text-sm text-yellow-600">R$ {(item.price || 0) * item.quantity}</p>
                <div className="flex space-x-1 mt-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => decreaseQuantity(item.id, item.selectedSize)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                  >
                    <Minus size={14} />
                  </motion.button>
                  <span className="font-semibold text-sm">{item.quantity}</span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => increaseQuantity(item.id, item.selectedSize)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600"
                  >
                    <Plus size={14} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeItem(item.id, item.selectedSize)}
                    className="p-1 rounded-full bg-red-100 hover:bg-red-200 text-red-500"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>
              </div>
            </div>
          ))
          
        )}
       


       
                  
      </motion.div>
    );
  };

  
 
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black z-40"
          />
        
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 flex flex-col"
          >
            <div className="bg-gradient-to-r from-primary to-yellow-800 text-white">
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl md:text-2xl font-bold">Seu Carrinho</h2>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger>

                 <Button variant={'ghost'} size={'icon'} onClick={() => setShowOpenOrders(!showOpenOrders)}>
                  {showOpenOrders ? <Package size={20} /> : <Package size={20} />}
                 </Button>
                    </TooltipTrigger>
                    <TooltipContent>
           {showOpenOrders ? <p>Fechar aba Pedidos</p> : <p>Abrir aba Pedidos</p>}
            </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button size={'icon'} variant={'ghost'} onClick={handleClose} >
                    <X size={24} />
                  </Button>
                  </div>
                </div>
              </div>
              
            </div>
            {step > 0 && (
              <div className="p-2">
                <StepGuide 
                  steps={['Carrinho', 'Endereço', 'Pagamento', 'Confirmação']} 
                  currentStep={step} 
                />
              </div>
            )}

            <div className="flex-grow overflow-y-auto p-4">
              {renderStep()}
            </div>
            {step === 0 && !showOpenOrders && renderCartShowcase() //Se estiver do cart vai mostrado a vitrine 
            }  
             {!showOpenOrders && step === 0 && (
               
              <div className="border-t p-4 bg-white shadow-md">
                {items.length > 0 ? (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-xl font-bold text-green-600">R$ {total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button onClick={onClose} variant="outline">Continuar Comprando</Button>
                      <Button onClick={() => setStep(1)}>
                        Finalizar Compra
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button 
                    onClick={() => setShowOpenOrders(true)} 
                    className="w-full"
                    variant="outline"
                  >
                    Ver Pedidos Abertos
                  </Button>
                )}
              </div>
            )}

            {!showOpenOrders && step > 0 && !purchaseCompleted && (
              <div className="border-t p-4 flex justify-between bg-white shadow-md">
                <Button onClick={prevStep} variant="outline" disabled={isProcessingPurchase}>Voltar</Button>
                {step === 3 && (
                  <Button 
                    onClick={handleConfirmPurchase} 
                    disabled={isProcessingPurchase}
                  >
                    {isProcessingPurchase ? 'Processando...' : 'Confirmar Compra'}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
 












