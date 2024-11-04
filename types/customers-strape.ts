export interface CustomersStrape {
  data: CustomerData[]
  meta: Meta
}

export interface CustomerData {
  id: number
  attributes: Attributes
}

export interface Attributes {
  first_name: string
  email: string
  phone: string
  last_name: string
  address: Address //DESCONTINUADO
  cpf: string
  createdAt: string
  updatedAt: string
  publishedAt: string
  enderecos: Enderecos //NOVO MODELO DE ENDERECOS
}

export interface Address {
  city: string
  state: string
  number: string
  street: string
  country: string
  zipCode: string
  complement: string
  neighborhood: string
}

export interface Enderecos {
  data: Daum2[]
}

export interface Daum2 {
  id: number
  attributes: Attributes2
}

export interface Attributes2 {
  Nome: string
  Rua: string
  Cep: string
  Cidade: string
  Bairro: string
  Estado: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface Meta {
  pagination: Pagination
}

export interface Pagination {
  page: number
  pageSize: number
  pageCount: number
  total: number
}
