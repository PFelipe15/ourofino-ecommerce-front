import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ProductsData } from '../../types/product-all-strape';

export interface CartItem  {
  id:number
  attributes:ProductsData['attributes']
  quantity: number;
  selectedSize: string;
  price: number | undefined; 
  subtotal: number | undefined;
}

interface CartStore {
  items: CartItem[];
  step: number;
  addItem: (product: ProductsData, quantity: number, price:number | undefined, selectedSize?: string | undefined) => void;
  removeItem: (id: number, selectedSize: string) => void;
  clearCart: () => void;
  increaseQuantity: (id: number, selectedSize: string) => void;
  decreaseQuantity: (id: number, selectedSize: string) => void;
  updateItemSize: (itemId: number, oldSize: string, newSize: string) => void;
  setStep: (step: number) => void;
  resetStep: () => void;
  resetCart: () => void;
  isOrderCompleted: boolean;
  setOrderCompleted: (completed: boolean) => void;
  clearLocalStorage: () => void;
  forceReset: () => void;
}

export const useCartStore = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],
      step: 0,
      addItem: (item, quantity, price, selectedSize) => set((state) => {
        const hasVariants = item.attributes.variants_price !== null;
        
        const existingItemIndex = state.items.findIndex(
          (cartItem) => {
            if (hasVariants) {
              return cartItem.id === item.id && cartItem.selectedSize === selectedSize;
            } else {
              return cartItem.id === item.id;
            }
          }
        );

        let updatedItems;
        if (existingItemIndex !== -1) {
          updatedItems = [...state.items];
          if (updatedItems[existingItemIndex]) {
            updatedItems[existingItemIndex].quantity += quantity;
            updatedItems[existingItemIndex].subtotal = (updatedItems[existingItemIndex].price ?? 0) * updatedItems[existingItemIndex].quantity;
          }
        } else {
          const newItem: CartItem = {
            ...item,
            quantity,
            selectedSize: hasVariants ? (selectedSize ?? '') : '',
            price: price ?? 0,
            subtotal: (price ?? 0) * quantity,
          };
          updatedItems = [...state.items, newItem];
        }

        return { items: updatedItems, step: 0 };
      }),
      removeItem: (id: number, selectedSize: string) => set((state) => {
        const itemToRemove = state.items.find(item => item.id === id);
        const hasVariants = itemToRemove?.attributes.variants_price !== null;

        return {
          items: state.items.filter((item) => {
            if (hasVariants) {
              return !(item.id === id && item.selectedSize === selectedSize);
            } else {
              return item.id !== id;
            }
          }),
        };
      }),
      clearCart: () => set({ items: [] }),
      increaseQuantity: (id: number, selectedSize: string) => set((state) => {
        const itemToUpdate = state.items.find(item => item.id === id);
        const hasVariants = itemToUpdate?.attributes.variants_price !== null;

        const updatedItems = state.items.map((item) => {
          if (hasVariants) {
            if (item.id === id && item.selectedSize === selectedSize) {
              return {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.price ?? 0) * (item.quantity + 1),
              };
            }
          } else {
            if (item.id === id) {
              return {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.price ?? 0) * (item.quantity + 1),
              };
            }
          }
          return item;
        });
        return { items: updatedItems };
      }),
      decreaseQuantity: (id: number, selectedSize: string) => set((state) => {
        const itemToUpdate = state.items.find(item => item.id === id);
        const hasVariants = itemToUpdate?.attributes.variants_price !== null;

        const updatedItems = state.items.map((item) => {
          if (hasVariants) {
            if (item.id === id && item.selectedSize === selectedSize && item.quantity > 1) {
              return {
                ...item,
                quantity: item.quantity - 1,
                subtotal: (item.price ?? 0) * (item.quantity - 1),
              };
            }
          } else {
            if (item.id === id && item.quantity > 1) {
              return {
                ...item,
                quantity: item.quantity - 1,
                subtotal: (item.price ?? 0) * (item.quantity - 1),
              };
            }
          }
          return item;
        }).filter((item) => item.quantity > 0);
        return { items: updatedItems };
      }),
      updateItemSize: (itemId: number, oldSize: string, newSize: string) => set((state) => {
        const itemIndex = state.items.findIndex(item => item.id === itemId && item.selectedSize === oldSize)
        if (itemIndex === -1) return state

        const newItems = [...state.items]
        const updatedItem = { ...newItems[itemIndex], selectedSize: newSize }

        // Verifica se já existe um item com o novo tamanho
        const existingNewSizeIndex = newItems.findIndex(item => item.id === itemId && item.selectedSize === newSize)

        if (existingNewSizeIndex !== -1) {
          // Se existir, soma as quantidades e remove o item antigo
          newItems[existingNewSizeIndex].quantity += updatedItem.quantity
          newItems.splice(itemIndex, 1)
        } else {
          // Se não existir, apenas atualiza o item
          newItems[itemIndex] = updatedItem
        }

        return { items: newItems }
      }),
      setStep: (newStep: number) => set((state) => {
        if (state.step !== newStep) {
          return { step: newStep }
        }
        return state
      }),
      resetStep: () => set((state) => {
        if (state.step !== 0) {
          return { step: 0 }
        }
        return state
      }),
      resetCart: () => {
        const state = get()
        if (state.items.length > 0 || state.step !== 0 || state.isOrderCompleted) {
          set({ 
            items: [], 
            step: 0, 
            isOrderCompleted: false 
          })
          get().clearLocalStorage()
        }
      },
      isOrderCompleted: false,
      setOrderCompleted: (completed: boolean) => set((state) => {
        if (state.isOrderCompleted !== completed) {
          return { isOrderCompleted: completed }
        }
        return state
      }),
      clearLocalStorage: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart-storage')
        }
      },
      forceReset: () => {
        set({ 
          items: [], 
          step: 0, 
          isOrderCompleted: false 
        })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('cart-storage')
          window.location.reload()
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        }
      }),
    }
  )
)
