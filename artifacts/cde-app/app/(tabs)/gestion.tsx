import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useCrm, Client, Quote, Invoice, LineItem } from "@/contexts/CrmContext";
import { useAppConfig } from "@/contexts/AppConfigContext";

type MainTab = "clients" | "quotes" | "invoices";
type View =
  | { type: "list" }
  | { type: "clientForm"; client?: Client }
  | { type: "clientDetail"; id: string }
  | { type: "quoteForm"; quote?: Quote }
  | { type: "quoteDetail"; id: string }
  | { type: "invoiceForm"; invoice?: Invoice; fromQuoteId?: string }
  | { type: "invoiceDetail"; id: string };

function uid() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon", sent: "Envoyé", accepted: "Accepté", refused: "Refusé",
  pending: "En attente", paid: "Payé", overdue: "En retard",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "#6B7280", sent: "#3B82F6", accepted: "#10B981", refused: "#EF4444",
  pending: "#F59E0B", paid: "#10B981", overdue: "#EF4444",
};

function fmt(n: number) {
  return n.toFixed(2).replace(".", ",") + " €";
}

function fmtDate(d: string) {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("fr-FR");
}

export default function GestionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const crm = useCrm();
  const [tab, setTab] = useState<MainTab>("clients");
  const [view, setView] = useState<View>({ type: "list" });

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function goBack() { setView({ type: "list" }); }

  const isDetail = view.type !== "list";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View style={styles.headerRow}>
          {isDetail ? (
            <Pressable onPress={goBack} style={styles.backBtn}>
              <Feather name="arrow-left" size={22} color="#fff" />
            </Pressable>
          ) : (
            <View style={{ width: 36 }} />
          )}
          <Text style={styles.headerTitle}>
            {isDetail
              ? view.type === "clientForm" ? (view.client ? "Modifier client" : "Nouveau client")
              : view.type === "clientDetail" ? "Fiche client"
              : view.type === "quoteForm" ? (view.quote ? "Modifier devis" : "Nouveau devis")
              : view.type === "quoteDetail" ? "Détail devis"
              : view.type === "invoiceForm" ? "Nouvelle facture"
              : "Détail facture"
              : "Gestion"}
          </Text>
          {view.type === "list" && (
            <Pressable
              onPress={() => {
                if (tab === "clients") setView({ type: "clientForm" });
                else if (tab === "quotes") setView({ type: "quoteForm" });
                else setView({ type: "invoiceForm" });
              }}
              style={styles.addBtn}
            >
              <Feather name="plus" size={22} color="#fff" />
            </Pressable>
          )}
          {view.type !== "list" && <View style={{ width: 36 }} />}
        </View>

        {/* Sub-tabs (only on list view) */}
        {!isDetail && (
          <View style={styles.subTabRow}>
            {(["clients", "quotes", "invoices"] as MainTab[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => { setTab(t); setView({ type: "list" }); }}
                style={[styles.subTab, tab === t && styles.subTabActive]}
              >
                <Text style={[styles.subTabText, { color: tab === t ? "#fff" : "rgba(255,255,255,0.6)" }]}>
                  {t === "clients" ? `Clients (${crm.clients.length})`
                   : t === "quotes" ? `Devis (${crm.quotes.length})`
                   : `Factures (${crm.invoices.length})`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {view.type === "list" && tab === "clients" && (
          <ClientsList crm={crm} colors={colors} onSelect={(id) => setView({ type: "clientDetail", id })} onEdit={(c) => setView({ type: "clientForm", client: c })} />
        )}
        {view.type === "list" && tab === "quotes" && (
          <QuotesList crm={crm} colors={colors} onSelect={(id) => setView({ type: "quoteDetail", id })} onNew={() => setView({ type: "quoteForm" })} />
        )}
        {view.type === "list" && tab === "invoices" && (
          <InvoicesList crm={crm} colors={colors} onSelect={(id) => setView({ type: "invoiceDetail", id })} onNew={() => setView({ type: "invoiceForm" })} />
        )}
        {view.type === "clientForm" && (
          <ClientForm crm={crm} colors={colors} client={view.client} onDone={goBack} />
        )}
        {view.type === "clientDetail" && (
          <ClientDetail crm={crm} colors={colors} id={view.id}
            onEdit={(c) => setView({ type: "clientForm", client: c })}
            onNewQuote={() => { setTab("quotes"); setView({ type: "quoteForm" }); }}
            onDone={goBack}
          />
        )}
        {view.type === "quoteForm" && (
          <QuoteForm crm={crm} colors={colors} quote={view.quote} onDone={goBack} />
        )}
        {view.type === "quoteDetail" && (
          <QuoteDetail crm={crm} colors={colors} id={view.id}
            onEdit={(q) => setView({ type: "quoteForm", quote: q })}
            onConvert={(quoteId) => setView({ type: "invoiceForm", fromQuoteId: quoteId })}
            onDone={goBack}
          />
        )}
        {view.type === "invoiceForm" && (
          <InvoiceForm crm={crm} colors={colors} invoice={view.invoice} fromQuoteId={view.fromQuoteId} onDone={goBack} />
        )}
        {view.type === "invoiceDetail" && (
          <InvoiceDetail crm={crm} colors={colors} id={view.id}
            onEdit={(inv) => setView({ type: "invoiceForm", invoice: inv })}
            onDone={goBack}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── CLIENTS LIST ────────────────────────────────────────────────────────────

function ClientsList({ crm, colors, onSelect, onEdit }: any) {
  const [search, setSearch] = useState("");
  const filtered = crm.clients.filter((c: Client) =>
    `${c.name} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <View style={{ gap: 12 }}>
      <TextInput
        style={[styles.searchInput, { backgroundColor: colors.card, color: colors.foreground, borderColor: colors.border }]}
        placeholder="Rechercher un client..."
        placeholderTextColor={colors.mutedForeground}
        value={search}
        onChangeText={setSearch}
      />
      {filtered.length === 0 && (
        <EmptyState icon="users" text={search ? "Aucun client trouvé" : "Aucun client pour l'instant\nAppuyez sur + pour en ajouter"} colors={colors} />
      )}
      {filtered.map((c: Client) => (
        <Pressable
          key={c.id}
          onPress={() => onSelect(c.id)}
          style={({ pressed }) => [styles.listCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{c.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.listCardTitle, { color: colors.foreground }]}>{c.name}</Text>
            <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{c.phone}{c.email ? ` · ${c.email}` : ""}</Text>
            {c.city ? <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{c.city}</Text> : null}
          </View>
          <Pressable onPress={() => onEdit(c)} style={[styles.editIconBtn, { backgroundColor: colors.muted }]}>
            <Feather name="edit-2" size={15} color={colors.mutedForeground} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}

// ─── CLIENT FORM ─────────────────────────────────────────────────────────────

function ClientForm({ crm, colors, client, onDone }: any) {
  const [form, setForm] = useState({
    name: client?.name ?? "", phone: client?.phone ?? "", email: client?.email ?? "",
    address: client?.address ?? "", postalCode: client?.postalCode ?? "",
    city: client?.city ?? "", notes: client?.notes ?? "",
  });

  async function save() {
    if (!form.name.trim()) { Alert.alert("Erreur", "Le nom est requis"); return; }
    if (client) await crm.updateClient(client.id, form);
    else await crm.addClient(form);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDone();
  }

  async function del() {
    Alert.alert("Supprimer ?", `Supprimer ${client.name} ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: async () => { await crm.deleteClient(client.id); onDone(); } },
    ]);
  }

  return (
    <View style={{ gap: 12 }}>
      <FormCard colors={colors}>
        <FLabel label="Nom *" colors={colors}>
          <FInput value={form.name} onChangeText={(v: string) => setForm((f: any) => ({ ...f, name: v }))} colors={colors} placeholder="Dupont Jean" />
        </FLabel>
        <FLabel label="Téléphone" colors={colors}>
          <FInput value={form.phone} onChangeText={(v: string) => setForm((f: any) => ({ ...f, phone: v }))} colors={colors} placeholder="06 12 34 56 78" keyboardType="phone-pad" />
        </FLabel>
        <FLabel label="Email" colors={colors}>
          <FInput value={form.email} onChangeText={(v: string) => setForm((f: any) => ({ ...f, email: v }))} colors={colors} placeholder="jean@email.fr" keyboardType="email-address" />
        </FLabel>
        <FLabel label="Adresse" colors={colors}>
          <FInput value={form.address} onChangeText={(v: string) => setForm((f: any) => ({ ...f, address: v }))} colors={colors} placeholder="12 rue de la Paix" />
        </FLabel>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <FLabel label="Code postal" colors={colors}>
              <FInput value={form.postalCode} onChangeText={(v: string) => setForm((f: any) => ({ ...f, postalCode: v }))} colors={colors} placeholder="75000" keyboardType="number-pad" />
            </FLabel>
          </View>
          <View style={{ flex: 2 }}>
            <FLabel label="Ville" colors={colors}>
              <FInput value={form.city} onChangeText={(v: string) => setForm((f: any) => ({ ...f, city: v }))} colors={colors} placeholder="Paris" />
            </FLabel>
          </View>
        </View>
        <FLabel label="Notes" colors={colors}>
          <FInput value={form.notes} onChangeText={(v: string) => setForm((f: any) => ({ ...f, notes: v }))} colors={colors} placeholder="Observations..." multiline />
        </FLabel>
      </FormCard>
      <ActionBtn label="Enregistrer" icon="check" color={colors.accent} onPress={save} />
      {client && <ActionBtn label="Supprimer ce client" icon="trash-2" color={colors.destructive} onPress={del} />}
    </View>
  );
}

// ─── CLIENT DETAIL ───────────────────────────────────────────────────────────

function ClientDetail({ crm, colors, id, onEdit, onNewQuote, onDone }: any) {
  const client: Client | undefined = crm.getClientById(id);
  if (!client) return <EmptyState icon="user-x" text="Client introuvable" colors={colors} />;
  const clientQuotes: Quote[] = crm.quotes.filter((q: Quote) => q.clientId === id);
  const clientInvoices: Invoice[] = crm.invoices.filter((i: Invoice) => i.clientId === id);

  return (
    <View style={{ gap: 14 }}>
      <View style={[styles.detailHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatarLg, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarLgText, { color: colors.primary }]}>{client.name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={[styles.detailName, { color: colors.foreground }]}>{client.name}</Text>
        {client.phone ? <InfoLine icon="phone" text={client.phone} colors={colors} /> : null}
        {client.email ? <InfoLine icon="mail" text={client.email} colors={colors} /> : null}
        {client.address ? <InfoLine icon="map-pin" text={`${client.address}${client.postalCode ? `, ${client.postalCode}` : ""} ${client.city ?? ""}`} colors={colors} /> : null}
        {client.notes ? <InfoLine icon="file-text" text={client.notes} colors={colors} /> : null}
        <Pressable onPress={() => onEdit(client)} style={[styles.editBtn, { borderColor: colors.primary }]}>
          <Feather name="edit-2" size={15} color={colors.primary} />
          <Text style={[styles.editBtnText, { color: colors.primary }]}>Modifier</Text>
        </Pressable>
      </View>

      <SectionHeader title={`Devis (${clientQuotes.length})`} colors={colors} action="Nouveau devis" onAction={onNewQuote} />
      {clientQuotes.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>Aucun devis pour ce client</Text>
      ) : clientQuotes.map((q) => (
        <MiniCard key={q.id} title={q.number} sub={`${fmt(q.totalTTC)} · ${fmtDate(q.date)}`} status={q.status} colors={colors} />
      ))}

      <SectionHeader title={`Factures (${clientInvoices.length})`} colors={colors} />
      {clientInvoices.length === 0 ? (
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14 }}>Aucune facture pour ce client</Text>
      ) : clientInvoices.map((inv) => (
        <MiniCard key={inv.id} title={inv.number} sub={`${fmt(inv.totalTTC)} · Échéance ${fmtDate(inv.dueDate)}`} status={inv.status} colors={colors} />
      ))}
    </View>
  );
}

// ─── QUOTES LIST ─────────────────────────────────────────────────────────────

function QuotesList({ crm, colors, onSelect }: any) {
  const sorted = [...crm.quotes].sort((a: Quote, b: Quote) => b.date.localeCompare(a.date));
  return (
    <View style={{ gap: 12 }}>
      {sorted.length === 0 && <EmptyState icon="file-text" text={"Aucun devis pour l'instant\nAppuyez sur + pour en créer"} colors={colors} />}
      {sorted.map((q: Quote) => {
        const client = crm.getClientById(q.clientId);
        return (
          <Pressable key={q.id} onPress={() => onSelect(q.id)}
            style={({ pressed }) => [styles.listCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.docIcon, { backgroundColor: "#3B82F6" + "20" }]}>
              <Feather name="file-text" size={20} color="#3B82F6" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.listCardTitle, { color: colors.foreground }]}>{q.number}</Text>
              <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{client?.name ?? "Client inconnu"} · {fmtDate(q.date)}</Text>
              <Text style={[styles.listCardSub, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{fmt(q.totalTTC)}</Text>
            </View>
            <StatusBadge status={q.status} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── QUOTE FORM ───────────────────────────────────────────────────────────────

function QuoteForm({ crm, colors, quote, onDone }: any) {
  const today = new Date().toISOString().split("T")[0];
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [clientId, setClientId] = useState(quote?.clientId ?? "");
  const [items, setItems] = useState<LineItem[]>(quote?.items ?? []);
  const [tvaRate, setTvaRate] = useState(quote?.tvaRate ?? 10);
  const [date, setDate] = useState(quote?.date ?? today);
  const [validUntil, setValidUntil] = useState(quote?.validUntil ?? in30);
  const [notes, setNotes] = useState(quote?.notes ?? "");
  const [status, setStatus] = useState<any>(quote?.status ?? "draft");

  const totalHT = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  function addItem() {
    setItems((prev) => [...prev, { id: uid(), description: "", quantity: 1, unitPrice: 0, unit: "forfait" }]);
  }
  function updateItem(id: string, field: string, value: any) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function save() {
    if (!clientId) { Alert.alert("Erreur", "Sélectionnez un client"); return; }
    if (items.length === 0) { Alert.alert("Erreur", "Ajoutez au moins une prestation"); return; }
    const data = { clientId, items, tvaRate, date, validUntil, notes, status, totalHT, totalTVA, totalTTC };
    if (quote) await crm.updateQuote(quote.id, data);
    else await crm.addQuote(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDone();
  }

  return (
    <View style={{ gap: 12 }}>
      <FormCard colors={colors}>
        <FLabel label="Client *" colors={colors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {crm.clients.length === 0 && (
                <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 13 }}>Aucun client — créez-en un d'abord</Text>
              )}
              {crm.clients.map((c: Client) => (
                <Pressable key={c.id} onPress={() => setClientId(c.id)}
                  style={[styles.chip, { backgroundColor: clientId === c.id ? colors.primary : colors.muted }]}>
                  <Text style={[styles.chipText, { color: clientId === c.id ? "#fff" : colors.mutedForeground }]}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </FLabel>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <FLabel label="Date" colors={colors}>
              <FInput value={date} onChangeText={setDate} colors={colors} placeholder="2024-01-01" />
            </FLabel>
          </View>
          <View style={{ flex: 1 }}>
            <FLabel label="Valide jusqu'au" colors={colors}>
              <FInput value={validUntil} onChangeText={setValidUntil} colors={colors} placeholder="2024-02-01" />
            </FLabel>
          </View>
        </View>
        <FLabel label="TVA (%)" colors={colors}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 10, 20].map((r) => (
              <Pressable key={r} onPress={() => setTvaRate(r)}
                style={[styles.chip, { backgroundColor: tvaRate === r ? colors.primary : colors.muted }]}>
                <Text style={[styles.chipText, { color: tvaRate === r ? "#fff" : colors.mutedForeground }]}>{r}%</Text>
              </Pressable>
            ))}
          </View>
        </FLabel>
        <FLabel label="Statut" colors={colors}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {(["draft", "sent", "accepted", "refused"] as const).map((s) => (
              <Pressable key={s} onPress={() => setStatus(s)}
                style={[styles.chip, { backgroundColor: status === s ? STATUS_COLORS[s] : colors.muted }]}>
                <Text style={[styles.chipText, { color: status === s ? "#fff" : colors.mutedForeground }]}>{STATUS_LABELS[s]}</Text>
              </Pressable>
            ))}
          </View>
        </FLabel>
      </FormCard>

      <SectionHeader title="Prestations" colors={colors} action="+ Ajouter" onAction={addItem} />
      {items.map((item) => (
        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FInput value={item.description} onChangeText={(v: string) => updateItem(item.id, "description", v)}
            colors={colors} placeholder="Description de la prestation" />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Qté</Text>
              <FInput value={String(item.quantity)} onChangeText={(v: string) => updateItem(item.id, "quantity", parseFloat(v) || 0)}
                colors={colors} placeholder="1" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Unité</Text>
              <FInput value={item.unit} onChangeText={(v: string) => updateItem(item.id, "unit", v)} colors={colors} placeholder="m²" />
            </View>
            <View style={{ flex: 1.2 }}>
              <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Prix unitaire HT</Text>
              <FInput value={String(item.unitPrice)} onChangeText={(v: string) => updateItem(item.id, "unitPrice", parseFloat(v) || 0)}
                colors={colors} placeholder="0.00" keyboardType="decimal-pad" />
            </View>
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </Pressable>
          </View>
          <Text style={[styles.itemTotal, { color: colors.primary }]}>
            Sous-total : {fmt(item.quantity * item.unitPrice)}
          </Text>
        </View>
      ))}

      {items.length > 0 && (
        <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TotalRow label="Total HT" value={fmt(totalHT)} colors={colors} />
          <TotalRow label={`TVA (${tvaRate}%)`} value={fmt(totalTVA)} colors={colors} />
          <TotalRow label="Total TTC" value={fmt(totalTTC)} colors={colors} bold />
        </View>
      )}

      <FLabel label="Notes" colors={colors}>
        <FInput value={notes} onChangeText={setNotes} colors={colors} placeholder="Conditions particulières..." multiline />
      </FLabel>

      <ActionBtn label="Enregistrer le devis" icon="check" color={colors.accent} onPress={save} />
      {quote && <ActionBtn label="Supprimer" icon="trash-2" color={colors.destructive} onPress={async () => {
        Alert.alert("Supprimer ?", "Supprimer ce devis ?", [
          { text: "Annuler", style: "cancel" },
          { text: "Supprimer", style: "destructive", onPress: async () => { await crm.deleteQuote(quote.id); onDone(); } },
        ]);
      }} />}
    </View>
  );
}

// ─── QUOTE DETAIL ────────────────────────────────────────────────────────────

function QuoteDetail({ crm, colors, id, onEdit, onConvert, onDone }: any) {
  const q: Quote | undefined = crm.quotes.find((x: Quote) => x.id === id);
  if (!q) return <EmptyState icon="file-x" text="Devis introuvable" colors={colors} />;
  const client = crm.getClientById(q.clientId);
  return (
    <View style={{ gap: 12 }}>
      <View style={[styles.detailHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detailName, { color: colors.foreground }]}>{q.number}</Text>
        <StatusBadge status={q.status} large />
        {client && <InfoLine icon="user" text={client.name} colors={colors} />}
        <InfoLine icon="calendar" text={`Date : ${fmtDate(q.date)} · Valide jusqu'au ${fmtDate(q.validUntil)}`} colors={colors} />
      </View>

      <SectionHeader title="Prestations" colors={colors} />
      {q.items.map((item) => (
        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.listCardTitle, { color: colors.foreground }]}>{item.description}</Text>
          <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{item.quantity} {item.unit} × {fmt(item.unitPrice)}</Text>
          <Text style={[styles.itemTotal, { color: colors.primary }]}>{fmt(item.quantity * item.unitPrice)}</Text>
        </View>
      ))}

      <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TotalRow label="Total HT" value={fmt(q.totalHT)} colors={colors} />
        <TotalRow label={`TVA (${q.tvaRate}%)`} value={fmt(q.totalTVA)} colors={colors} />
        <TotalRow label="Total TTC" value={fmt(q.totalTTC)} colors={colors} bold />
      </View>

      {q.notes ? <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>Notes</Text>
        <Text style={[styles.listCardTitle, { color: colors.foreground }]}>{q.notes}</Text>
      </View> : null}

      <ActionBtn label="Modifier le devis" icon="edit-2" color={colors.primary} onPress={() => onEdit(q)} />
      {q.status !== "accepted" && (
        <ActionBtn label="Convertir en facture" icon="file-plus" color={colors.accent} onPress={() => onConvert(q.id)} />
      )}
    </View>
  );
}

// ─── INVOICES LIST ───────────────────────────────────────────────────────────

function InvoicesList({ crm, colors, onSelect }: any) {
  const sorted = [...crm.invoices].sort((a: Invoice, b: Invoice) => b.date.localeCompare(a.date));
  const totalPending = crm.invoices.filter((i: Invoice) => i.status === "pending" || i.status === "overdue")
    .reduce((s: number, i: Invoice) => s + i.totalTTC, 0);

  return (
    <View style={{ gap: 12 }}>
      {crm.invoices.length > 0 && (
        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>En attente de paiement</Text>
          <Text style={styles.summaryValue}>{fmt(totalPending)}</Text>
        </View>
      )}
      {sorted.length === 0 && <EmptyState icon="file-minus" text={"Aucune facture pour l'instant\nAppuyez sur + pour en créer"} colors={colors} />}
      {sorted.map((inv: Invoice) => {
        const client = crm.getClientById(inv.clientId);
        return (
          <Pressable key={inv.id} onPress={() => onSelect(inv.id)}
            style={({ pressed }) => [styles.listCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }]}>
            <View style={[styles.docIcon, { backgroundColor: colors.accent + "20" }]}>
              <Feather name="file-minus" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.listCardTitle, { color: colors.foreground }]}>{inv.number}</Text>
              <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{client?.name ?? "Client inconnu"} · Échéance {fmtDate(inv.dueDate)}</Text>
              <Text style={[styles.listCardSub, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>{fmt(inv.totalTTC)}</Text>
            </View>
            <StatusBadge status={inv.status} />
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── INVOICE FORM ─────────────────────────────────────────────────────────────

function InvoiceForm({ crm, colors, invoice, fromQuoteId, onDone }: any) {
  const quote: Quote | undefined = fromQuoteId ? crm.quotes.find((q: Quote) => q.id === fromQuoteId) : undefined;
  const today = new Date().toISOString().split("T")[0];
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const [clientId, setClientId] = useState(invoice?.clientId ?? quote?.clientId ?? "");
  const [items, setItems] = useState<LineItem[]>(invoice?.items ?? quote?.items ?? []);
  const [tvaRate, setTvaRate] = useState(invoice?.tvaRate ?? quote?.tvaRate ?? 10);
  const [date, setDate] = useState(invoice?.date ?? today);
  const [dueDate, setDueDate] = useState(invoice?.dueDate ?? in30);
  const [notes, setNotes] = useState(invoice?.notes ?? quote?.notes ?? "");
  const [status, setStatus] = useState<any>(invoice?.status ?? "pending");

  const totalHT = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const totalTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + totalTVA;

  function addItem() {
    setItems((prev) => [...prev, { id: uid(), description: "", quantity: 1, unitPrice: 0, unit: "forfait" }]);
  }
  function updateItem(id: string, field: string, value: any) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  }
  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function save() {
    if (!clientId) { Alert.alert("Erreur", "Sélectionnez un client"); return; }
    const data = { clientId, items, tvaRate, date, dueDate, notes, status, totalHT, totalTVA, totalTTC, quoteId: fromQuoteId };
    if (invoice) await crm.updateInvoice(invoice.id, data);
    else await crm.addInvoice(data);
    if (fromQuoteId) await crm.updateQuote(fromQuoteId, { status: "accepted" });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDone();
  }

  return (
    <View style={{ gap: 12 }}>
      {quote && (
        <View style={[styles.infoBanner, { backgroundColor: colors.accent + "15", borderColor: colors.accent }]}>
          <Feather name="info" size={16} color={colors.accent} />
          <Text style={[styles.infoBannerText, { color: colors.accent }]}>Facture générée depuis le devis {quote.number}</Text>
        </View>
      )}
      <FormCard colors={colors}>
        <FLabel label="Client *" colors={colors}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {crm.clients.map((c: Client) => (
                <Pressable key={c.id} onPress={() => setClientId(c.id)}
                  style={[styles.chip, { backgroundColor: clientId === c.id ? colors.primary : colors.muted }]}>
                  <Text style={[styles.chipText, { color: clientId === c.id ? "#fff" : colors.mutedForeground }]}>{c.name}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </FLabel>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <FLabel label="Date" colors={colors}>
              <FInput value={date} onChangeText={setDate} colors={colors} placeholder="2024-01-01" />
            </FLabel>
          </View>
          <View style={{ flex: 1 }}>
            <FLabel label="Échéance" colors={colors}>
              <FInput value={dueDate} onChangeText={setDueDate} colors={colors} placeholder="2024-02-01" />
            </FLabel>
          </View>
        </View>
        <FLabel label="TVA (%)" colors={colors}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[0, 10, 20].map((r) => (
              <Pressable key={r} onPress={() => setTvaRate(r)}
                style={[styles.chip, { backgroundColor: tvaRate === r ? colors.primary : colors.muted }]}>
                <Text style={[styles.chipText, { color: tvaRate === r ? "#fff" : colors.mutedForeground }]}>{r}%</Text>
              </Pressable>
            ))}
          </View>
        </FLabel>
        <FLabel label="Statut" colors={colors}>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {(["pending", "paid", "overdue"] as const).map((s) => (
              <Pressable key={s} onPress={() => setStatus(s)}
                style={[styles.chip, { backgroundColor: status === s ? STATUS_COLORS[s] : colors.muted }]}>
                <Text style={[styles.chipText, { color: status === s ? "#fff" : colors.mutedForeground }]}>{STATUS_LABELS[s]}</Text>
              </Pressable>
            ))}
          </View>
        </FLabel>
      </FormCard>

      <SectionHeader title="Prestations" colors={colors} action="+ Ajouter" onAction={addItem} />
      {items.map((item) => (
        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FInput value={item.description} onChangeText={(v: string) => updateItem(item.id, "description", v)} colors={colors} placeholder="Description" />
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Qté</Text>
              <FInput value={String(item.quantity)} onChangeText={(v: string) => updateItem(item.id, "quantity", parseFloat(v) || 0)} colors={colors} placeholder="1" keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Unité</Text>
              <FInput value={item.unit} onChangeText={(v: string) => updateItem(item.id, "unit", v)} colors={colors} placeholder="m²" />
            </View>
            <View style={{ flex: 1.2 }}>
              <Text style={[styles.itemLabel, { color: colors.mutedForeground }]}>Prix HT</Text>
              <FInput value={String(item.unitPrice)} onChangeText={(v: string) => updateItem(item.id, "unitPrice", parseFloat(v) || 0)} colors={colors} placeholder="0.00" keyboardType="decimal-pad" />
            </View>
            <Pressable onPress={() => removeItem(item.id)} style={styles.removeBtn}>
              <Feather name="trash-2" size={16} color={colors.destructive} />
            </Pressable>
          </View>
          <Text style={[styles.itemTotal, { color: colors.primary }]}>{fmt(item.quantity * item.unitPrice)}</Text>
        </View>
      ))}

      {items.length > 0 && (
        <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TotalRow label="Total HT" value={fmt(totalHT)} colors={colors} />
          <TotalRow label={`TVA (${tvaRate}%)`} value={fmt(totalTVA)} colors={colors} />
          <TotalRow label="Total TTC" value={fmt(totalTTC)} colors={colors} bold />
        </View>
      )}

      <FLabel label="Notes" colors={colors}>
        <FInput value={notes} onChangeText={setNotes} colors={colors} placeholder="Conditions de paiement..." multiline />
      </FLabel>

      <ActionBtn label="Enregistrer la facture" icon="check" color={colors.accent} onPress={save} />
    </View>
  );
}

// ─── INVOICE DETAIL ───────────────────────────────────────────────────────────

function InvoiceDetail({ crm, colors, id, onEdit }: any) {
  const inv: Invoice | undefined = crm.invoices.find((x: Invoice) => x.id === id);
  if (!inv) return <EmptyState icon="file-x" text="Facture introuvable" colors={colors} />;
  const client = crm.getClientById(inv.clientId);
  return (
    <View style={{ gap: 12 }}>
      <View style={[styles.detailHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.detailName, { color: colors.foreground }]}>{inv.number}</Text>
        <StatusBadge status={inv.status} large />
        {client && <InfoLine icon="user" text={client.name} colors={colors} />}
        <InfoLine icon="calendar" text={`Émise le ${fmtDate(inv.date)} · Échéance ${fmtDate(inv.dueDate)}`} colors={colors} />
        {inv.paidDate && <InfoLine icon="check-circle" text={`Payée le ${fmtDate(inv.paidDate)}`} colors={colors} />}
      </View>

      <SectionHeader title="Prestations" colors={colors} />
      {inv.items.map((item) => (
        <View key={item.id} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.listCardTitle, { color: colors.foreground }]}>{item.description}</Text>
          <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{item.quantity} {item.unit} × {fmt(item.unitPrice)}</Text>
          <Text style={[styles.itemTotal, { color: colors.primary }]}>{fmt(item.quantity * item.unitPrice)}</Text>
        </View>
      ))}

      <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TotalRow label="Total HT" value={fmt(inv.totalHT)} colors={colors} />
        <TotalRow label={`TVA (${inv.tvaRate}%)`} value={fmt(inv.totalTVA)} colors={colors} />
        <TotalRow label="Total TTC" value={fmt(inv.totalTTC)} colors={colors} bold />
      </View>

      <ActionBtn label="Modifier" icon="edit-2" color={colors.primary} onPress={() => onEdit(inv)} />
      {inv.status !== "paid" && (
        <ActionBtn label="Marquer comme payée" icon="check-circle" color={colors.accent} onPress={async () => {
          await crm.updateInvoice(inv.id, { status: "paid", paidDate: new Date().toISOString().split("T")[0] });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }} />
      )}
    </View>
  );
}

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

function EmptyState({ icon, text, colors }: any) {
  return (
    <View style={styles.emptyState}>
      <Feather name={icon} size={40} color={colors.mutedForeground} />
      <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{text}</Text>
    </View>
  );
}

function FormCard({ colors, children }: any) {
  return (
    <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function FLabel({ label, colors, children }: any) {
  return (
    <View style={{ gap: 6, marginBottom: 8 }}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      {children}
    </View>
  );
}

function FInput({ value, onChangeText, colors, placeholder, multiline = false, keyboardType = "default" }: any) {
  return (
    <TextInput
      style={[styles.fieldInput, multiline && { height: 80, textAlignVertical: "top", paddingTop: 10 }, { backgroundColor: colors.muted, color: colors.foreground }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      multiline={multiline}
      keyboardType={keyboardType}
    />
  );
}

function SectionHeader({ title, colors, action, onAction }: any) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
      <Text style={[styles.sectionHead, { color: colors.foreground }]}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction}>
          <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold", fontSize: 14 }}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

function ActionBtn({ label, icon, color, onPress }: any) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionBtn, { backgroundColor: color, opacity: pressed ? 0.85 : 1 }]}>
      <Feather name={icon} size={18} color="#fff" />
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

function StatusBadge({ status, large = false }: any) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] + "20" }]}>
      <Text style={[styles.badgeText, { color: STATUS_COLORS[status], fontSize: large ? 13 : 11 }]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

function MiniCard({ title, sub, status, colors }: any) {
  return (
    <View style={[styles.miniCard, { backgroundColor: colors.muted }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.listCardTitle, { color: colors.foreground, fontSize: 14 }]}>{title}</Text>
        <Text style={[styles.listCardSub, { color: colors.mutedForeground }]}>{sub}</Text>
      </View>
      <StatusBadge status={status} />
    </View>
  );
}

function InfoLine({ icon, text, colors }: any) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 2 }}>
      <Feather name={icon} size={14} color={colors.mutedForeground} />
      <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", fontSize: 14, flex: 1 }}>{text}</Text>
    </View>
  );
}

function TotalRow({ label, value, colors, bold = false }: any) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }}>
      <Text style={{ color: colors.mutedForeground, fontFamily: bold ? "Inter_700Bold" : "Inter_400Regular", fontSize: bold ? 16 : 14 }}>{label}</Text>
      <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold", fontSize: bold ? 16 : 14 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 0 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  subTabRow: { flexDirection: "row", paddingHorizontal: 12, paddingBottom: 0 },
  subTab: { flex: 1, paddingVertical: 10, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  subTabActive: { borderBottomColor: "#fff" },
  subTabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  searchInput: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", borderWidth: 1 },
  listCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 14, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  listCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, marginBottom: 2 },
  listCardSub: { fontFamily: "Inter_400Regular", fontSize: 13 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  avatarLg: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 8 },
  avatarLgText: { fontFamily: "Inter_700Bold", fontSize: 26 },
  docIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  editIconBtn: { width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 15, textAlign: "center", lineHeight: 22 },
  formCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  fieldInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  itemCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  itemLabel: { fontFamily: "Inter_400Regular", fontSize: 11, marginBottom: 4 },
  itemTotal: { fontFamily: "Inter_700Bold", fontSize: 13, marginTop: 6, textAlign: "right" },
  removeBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center", alignSelf: "flex-end" },
  totalCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  actionBtn: { borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  actionBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontFamily: "Inter_600SemiBold" },
  miniCard: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, gap: 10 },
  sectionHead: { fontFamily: "Inter_700Bold", fontSize: 17 },
  detailHeader: { borderRadius: 16, borderWidth: 1, padding: 18, gap: 8 },
  detailName: { fontFamily: "Inter_700Bold", fontSize: 22 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start", marginTop: 8 },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  summaryCard: { borderRadius: 14, padding: 18, alignItems: "center" },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 13, color: "rgba(255,255,255,0.8)" },
  summaryValue: { fontFamily: "Inter_700Bold", fontSize: 28, color: "#fff", marginTop: 4 },
  notesCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6 },
  infoBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  infoBannerText: { fontFamily: "Inter_600SemiBold", fontSize: 13, flex: 1 },
});
