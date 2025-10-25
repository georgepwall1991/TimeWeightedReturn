// Client types
export interface ClientDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  portfolioCount: number;
}

export interface CreateClientRequest {
  name: string;
}

export interface CreateClientResponse {
  id: string;
  name: string;
  createdAt: string;
}

export interface UpdateClientRequest {
  name: string;
}

export interface DeleteClientResponse {
  message: string;
}

// Portfolio types
export interface PortfolioDto {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  accountCount: number;
}

export interface CreatePortfolioRequest {
  name: string;
  clientId: string;
}

export interface CreatePortfolioResponse {
  id: string;
  name: string;
  clientId: string;
  createdAt: string;
}

export interface UpdatePortfolioRequest {
  name: string;
}

export interface DeletePortfolioResponse {
  message: string;
}

// Account types
export interface AccountDto {
  id: string;
  name: string;
  accountNumber: string;
  currency: string;
  portfolioId: string;
  portfolioName: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  holdingCount: number;
  cashFlowCount: number;
}

export interface CreateAccountRequest {
  name: string;
  accountNumber: string;
  currency: string;
  portfolioId: string;
}

export interface CreateAccountResponse {
  id: string;
  name: string;
  accountNumber: string;
  currency: string;
  portfolioId: string;
  createdAt: string;
}

export interface UpdateAccountRequest {
  name: string;
  accountNumber: string;
  currency: string;
}

export interface DeleteAccountResponse {
  message: string;
}
