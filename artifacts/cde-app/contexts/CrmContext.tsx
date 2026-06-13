import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  notes: string;
  createdAt: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export type QuoteStatus = "draft" | "sent" | "accepted" | "refused";
export type InvoiceStatus = "pending" | "paid" | "overdue";

export interface Quote {
  id: string;
  number: string;
  clientId: string;
  items: LineItem[];
  tvaRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: QuoteStatus;
  date: string;
  validUntil: string;
  notes: string;
}

export interface Invoice {
  id: string;
  number: string;
  quoteId?: string;
  clientId: string;
  items: LineItem[];
  tvaRate: number;
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  paidDate?: string;
  notes: string;
}

interface CrmState {
  clients: Client[];
  quotes: Quote[];
  invoices: Invoice[];
}

interface CrmContextType extends CrmState {
  addClient: (c: Omit<Client, "id" | "createdAt">) => Promise<Client>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  addQuote: (q: Omit<Quote, "id" | "number">) => Promise<Quote>;
  updateQuote: (id: string, q: Partial<Quote>) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  addInvoice: (inv: Omit<Invoice, "id" | "number">) => Promise<Invoice>;
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  convertQuoteToInvoice: (quoteId: string) => Promise<Invoice>;
  getClientById: (id: string) => Client | undefined;
  loaded: boolean;
}

const CrmContext = createContext<CrmContextType>({} as CrmContextType);

const STORAGE_KEY = "cde_crm_data";

function uid() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function computeTotals(items: LineItem[], tvaRate: number) {
  const totalHT = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalTVA = totalHT * (tvaRate / 100);
  return { totalHT, totalTVA, totalTTC: totalHT + totalTVA };
}

function nextNumber(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear();
  const nums = existing
    .filter((n) => n.startsWith(`${prefix}-${year}`))
    .map((n) => parseInt(n.split("-").pop() ?? "0", 10))
    .filter((n) => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${year}-${String(next).padStart(3, "0")}`;
}

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CrmState>({ clients: [], quotes: [], invoices: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setState(JSON.parse(raw)); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (next: CrmState) => {
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addClient = useCallback(async (c: Omit<Client, "id" | "createdAt">): Promise<Client> => {
    const client: Client = { ...c, id: uid(), createdAt: new Date().toISOString() };
    await persist({ ...state, clients: [...state.clients, client] });
    return client;
  }, [state, persist]);

  const updateClient = useCallback(async (id: string, c: Partial<Client>) => {
    await persist({ ...state, clients: state.clients.map((x) => x.id === id ? { ...x, ...c } : x) });
  }, [state, persist]);

  const deleteClient = useCallback(async (id: string) => {
    await persist({ ...state, clients: state.clients.filter((x) => x.id !== id) });
  }, [state, persist]);

  const addQuote = useCallback(async (q: Omit<Quote, "id" | "number">): Promise<Quote> => {
    const totals = computeTotals(q.items, q.tvaRate);
    const quote: Quote = { ...q, ...totals, id: uid(), number: nextNumber("DV", state.quotes.map((x) => x.number)) };
    await persist({ ...state, quotes: [...state.quotes, quote] });
    return quote;
  }, [state, persist]);

  const updateQuote = useCallback(async (id: string, q: Partial<Quote>) => {
    const updated = state.quotes.map((x) => {
      if (x.id !== id) return x;
      const merged = { ...x, ...q };
      const totals = computeTotals(merged.items, merged.tvaRate);
      return { ...merged, ...totals };
    });
    await persist({ ...state, quotes: updated });
  }, [state, persist]);

  const deleteQuote = useCallback(async (id: string) => {
    await persist({ ...state, quotes: state.quotes.filter((x) => x.id !== id) });
  }, [state, persist]);

  const addInvoice = useCallback(async (inv: Omit<Invoice, "id" | "number">): Promise<Invoice> => {
    const totals = computeTotals(inv.items, inv.tvaRate);
    const invoice: Invoice = { ...inv, ...totals, id: uid(), number: nextNumber("FA", state.invoices.map((x) => x.number)) };
    await persist({ ...state, invoices: [...state.invoices, invoice] });
    return invoice;
  }, [state, persist]);

  const updateInvoice = useCallback(async (id: string, inv: Partial<Invoice>) => {
    const updated = state.invoices.map((x) => {
      if (x.id !== id) return x;
      const merged = { ...x, ...inv };
      const totals = computeTotals(merged.items, merged.tvaRate);
      return { ...merged, ...totals };
    });
    await persist({ ...state, invoices: updated });
  }, [state, persist]);

  const deleteInvoice = useCallback(async (id: string) => {
    await persist({ ...state, invoices: state.invoices.filter((x) => x.id !== id) });
  }, [state, persist]);

  const convertQuoteToInvoice = useCallback(async (quoteId: string): Promise<Invoice> => {
    const q = state.quotes.find((x) => x.id === quoteId);
    if (!q) throw new Error("Quote not found");
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const inv = await addInvoice({
      quoteId,
      clientId: q.clientId,
      items: q.items,
      tvaRate: q.tvaRate,
      totalHT: q.totalHT,
      totalTVA: q.totalTVA,
      totalTTC: q.totalTTC,
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      dueDate,
      notes: q.notes,
    });
    await updateQuote(quoteId, { status: "accepted" });
    return inv;
  }, [state, addInvoice, updateQuote]);

  const getClientById = useCallback((id: string) => state.clients.find((c) => c.id === id), [state]);

  return (
    <CrmContext.Provider value={{
      ...state, loaded,
      addClient, updateClient, deleteClient,
      addQuote, updateQuote, deleteQuote,
      addInvoice, updateInvoice, deleteInvoice,
      convertQuoteToInvoice, getClientById,
    }}>
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  return useContext(CrmContext);
}
