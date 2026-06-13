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
import { useAppConfig, ServiceConfig } from "@/contexts/AppConfigContext";

type AdminTab = "home" | "company" | "services" | "hours" | "stats" | "security";

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config, updateConfig, updateService, resetConfig } = useAppConfig();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>("company");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function handlePinSubmit() {
    if (pin === config.adminPin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setUnlocked(true);
      setPinError(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPinError(true);
      setPin("");
    }
  }

  if (!unlocked) {
    return (
      <View style={[styles.pinContainer, { backgroundColor: colors.background, paddingTop: topPad }]}>
        <View style={[styles.pinCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.pinIcon, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="lock" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.pinTitle, { color: colors.foreground }]}>Espace Admin</Text>
          <Text style={[styles.pinSubtitle, { color: colors.mutedForeground }]}>
            Entrez votre code PIN pour accéder à la configuration
          </Text>
          <TextInput
            style={[
              styles.pinInput,
              {
                backgroundColor: colors.muted,
                color: colors.foreground,
                borderColor: pinError ? colors.destructive : "transparent",
              },
            ]}
            placeholder="Code PIN"
            placeholderTextColor={colors.mutedForeground}
            value={pin}
            onChangeText={(v) => { setPin(v); setPinError(false); }}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
            onSubmitEditing={handlePinSubmit}
          />
          {pinError && (
            <Text style={[styles.pinError, { color: colors.destructive }]}>Code PIN incorrect</Text>
          )}
          <Pressable
            onPress={handlePinSubmit}
            style={({ pressed }) => [
              styles.pinBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.pinBtnText}>Accéder</Text>
          </Pressable>
          <Text style={[styles.pinHint, { color: colors.mutedForeground }]}>
            PIN par défaut : 1234
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Administration</Text>
        <Pressable onPress={() => { setUnlocked(false); setPin(""); }}>
          <Feather name="log-out" size={20} color="rgba(255,255,255,0.8)" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarInner}>
          {([
            { id: "home", label: "Accueil", icon: "home" },
            { id: "company", label: "Société", icon: "briefcase" },
            { id: "services", label: "Services", icon: "tool" },
            { id: "hours", label: "Horaires", icon: "clock" },
            { id: "stats", label: "Chiffres", icon: "bar-chart-2" },
            { id: "security", label: "Sécurité", icon: "shield" },
          ] as { id: AdminTab; label: string; icon: string }[]).map((tab) => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tabItem,
                activeTab === tab.id && { borderBottomColor: colors.primary },
              ]}
            >
              <Feather
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.id ? colors.primary : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab.id ? colors.primary : colors.mutedForeground },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad + 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === "home" && (
          <HomeTab colors={colors} config={config} updateConfig={updateConfig} />
        )}
        {activeTab === "company" && (
          <CompanyTab colors={colors} config={config} updateConfig={updateConfig} />
        )}
        {activeTab === "services" && (
          <ServicesTab colors={colors} config={config} updateService={updateService} />
        )}
        {activeTab === "hours" && (
          <HoursTab colors={colors} config={config} updateConfig={updateConfig} />
        )}
        {activeTab === "stats" && (
          <StatsTab colors={colors} config={config} updateConfig={updateConfig} />
        )}
        {activeTab === "security" && (
          <SecurityTab colors={colors} config={config} updateConfig={updateConfig} resetConfig={resetConfig} />
        )}
      </ScrollView>
    </View>
  );
}

function SaveButton({ onSave, colors }: { onSave: () => Promise<void>; colors: any }) {
  const [saving, setSaving] = useState(false);
  return (
    <Pressable
      onPress={async () => {
        setSaving(true);
        await onSave();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSaving(false);
      }}
      style={({ pressed }) => [
        styles.saveBtn,
        { backgroundColor: colors.accent, opacity: pressed || saving ? 0.8 : 1 },
      ]}
    >
      <Feather name="check" size={18} color="#fff" />
      <Text style={styles.saveBtnText}>{saving ? "Sauvegarde..." : "Sauvegarder"}</Text>
    </Pressable>
  );
}

function SectionTitle({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{title.toUpperCase()}</Text>
  );
}

function FieldInput({
  label,
  value,
  onChangeText,
  colors,
  multiline = false,
  keyboardType = "default",
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: any;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address" | "numeric";
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          multiline && styles.fieldTextarea,
          { backgroundColor: colors.muted, color: colors.foreground, borderColor: "transparent" },
        ]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function HomeTab({ colors, config, updateConfig }: any) {
  const [form, setForm] = useState({ ...config.home });
  return (
    <View style={{ gap: 12 }}>
      <SectionTitle title="Section héros" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FieldInput label="Badge drone (ex: DJI Matrice 350 RTK)" value={form.heroBadge} onChangeText={(v: string) => setForm((f: any) => ({ ...f, heroBadge: v }))} colors={colors} />
        <FieldInput label="Texte du bouton CTA" value={form.ctaLabel} onChangeText={(v: string) => setForm((f: any) => ({ ...f, ctaLabel: v }))} colors={colors} />
        <SaveButton onSave={() => updateConfig({ home: form })} colors={colors} />
      </View>

      <SectionTitle title="Section « Pourquoi nous »" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FieldInput label="Titre de section" value={form.whyUsTitle} onChangeText={(v: string) => setForm((f: any) => ({ ...f, whyUsTitle: v }))} colors={colors} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Points (un par ligne)</Text>
        <TextInput
          style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: "transparent", height: 160 }]}
          value={form.whyUsPoints.join("\n")}
          onChangeText={(v) => setForm((f: any) => ({ ...f, whyUsPoints: v.split("\n") }))}
          multiline
          textAlignVertical="top"
          placeholder="Un point par ligne..."
          placeholderTextColor={colors.mutedForeground}
        />
        <SaveButton onSave={() => updateConfig({ home: form })} colors={colors} />
      </View>

      <SectionTitle title="Section drone / technologie" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FieldInput label="Titre section" value={form.droneTitle} onChangeText={(v: string) => setForm((f: any) => ({ ...f, droneTitle: v }))} colors={colors} />
        <FieldInput label="Modèle drone (titre carte)" value={form.droneSubtitle} onChangeText={(v: string) => setForm((f: any) => ({ ...f, droneSubtitle: v }))} colors={colors} />
        <FieldInput label="Sous-titre carte drone" value={form.droneModel} onChangeText={(v: string) => setForm((f: any) => ({ ...f, droneModel: v }))} colors={colors} />
        <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Caractéristiques drone (un par ligne)</Text>
        <TextInput
          style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: "transparent", height: 120 }]}
          value={form.dronePoints.join("\n")}
          onChangeText={(v) => setForm((f: any) => ({ ...f, dronePoints: v.split("\n") }))}
          multiline
          textAlignVertical="top"
          placeholder="Une caractéristique par ligne..."
          placeholderTextColor={colors.mutedForeground}
        />
        <SaveButton onSave={() => updateConfig({ home: form })} colors={colors} />
      </View>
    </View>
  );
}

function CompanyTab({ colors, config, updateConfig }: any) {
  const [form, setForm] = useState({ ...config.company });
  return (
    <View style={{ gap: 4 }}>
      <SectionTitle title="Informations société" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FieldInput label="Nom" value={form.name} onChangeText={(v) => setForm((f: any) => ({ ...f, name: v }))} colors={colors} />
        <FieldInput label="Slogan" value={form.tagline} onChangeText={(v) => setForm((f: any) => ({ ...f, tagline: v }))} colors={colors} />
        <FieldInput label="Description (accueil)" value={form.description} onChangeText={(v) => setForm((f: any) => ({ ...f, description: v }))} colors={colors} multiline />
        <FieldInput label="Téléphone" value={form.phone} onChangeText={(v) => setForm((f: any) => ({ ...f, phone: v }))} colors={colors} keyboardType="phone-pad" />
        <FieldInput label="Email" value={form.email} onChangeText={(v) => setForm((f: any) => ({ ...f, email: v }))} colors={colors} keyboardType="email-address" />
        <FieldInput label="Adresse" value={form.address} onChangeText={(v) => setForm((f: any) => ({ ...f, address: v }))} colors={colors} />
        <FieldInput label="Zone d'intervention" value={form.zone} onChangeText={(v) => setForm((f: any) => ({ ...f, zone: v }))} colors={colors} />
        <SaveButton onSave={() => updateConfig({ company: form })} colors={colors} />
      </View>
    </View>
  );
}

function ServicesTab({ colors, config, updateService }: any) {
  const [selected, setSelected] = useState<string>(config.services[0].id);
  const service: ServiceConfig = config.services.find((s: ServiceConfig) => s.id === selected) ?? config.services[0];
  const [form, setForm] = useState<ServiceConfig>({ ...service });

  function selectService(id: string) {
    setSelected(id);
    const s = config.services.find((s: ServiceConfig) => s.id === id);
    if (s) setForm({ ...s });
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Service selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {config.services.map((s: ServiceConfig) => (
            <Pressable
              key={s.id}
              onPress={() => selectService(s.id)}
              style={[
                styles.serviceChip,
                { backgroundColor: selected === s.id ? s.accentColor : colors.muted, borderColor: "transparent" },
              ]}
            >
              <Text style={[styles.serviceChipText, { color: selected === s.id ? "#fff" : colors.mutedForeground }]}>
                {s.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FieldInput label="Titre" value={form.title} onChangeText={(v) => setForm((f) => ({ ...f, title: v }))} colors={colors} />
        <FieldInput label="Sous-titre" value={form.subtitle} onChangeText={(v) => setForm((f) => ({ ...f, subtitle: v }))} colors={colors} />
        <FieldInput label="Description" value={form.description} onChangeText={(v) => setForm((f) => ({ ...f, description: v }))} colors={colors} multiline />
        <FieldInput label="Tarif" value={form.price} onChangeText={(v) => setForm((f) => ({ ...f, price: v }))} colors={colors} />
        <FieldInput label="Unité de tarif (ex: /m², /h)" value={form.priceUnit} onChangeText={(v) => setForm((f) => ({ ...f, priceUnit: v }))} colors={colors} />

        <SectionTitle title="Points inclus (un par ligne)" colors={colors} />
        <TextInput
          style={[styles.fieldInput, styles.fieldTextarea, { backgroundColor: colors.muted, color: colors.foreground, borderColor: "transparent", height: 120 }]}
          value={form.points.join("\n")}
          onChangeText={(v) => setForm((f) => ({ ...f, points: v.split("\n").filter(Boolean) }))}
          multiline
          textAlignVertical="top"
          placeholder="Un point par ligne..."
          placeholderTextColor={colors.mutedForeground}
        />

        <SaveButton onSave={() => updateService(form.id, form)} colors={colors} />
      </View>
    </View>
  );
}

function HoursTab({ colors, config, updateConfig }: any) {
  const [hours, setHours] = useState([...config.hours]);
  return (
    <View style={{ gap: 4 }}>
      <SectionTitle title="Horaires d'ouverture" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {hours.map((h: any, i: number) => (
          <View key={i} style={styles.hourRow}>
            <TextInput
              style={[styles.hourInput, { backgroundColor: colors.muted, color: colors.foreground, flex: 1.5 }]}
              value={h.day}
              onChangeText={(v) => setHours((prev) => prev.map((x, j) => j === i ? { ...x, day: v } : x))}
            />
            <TextInput
              style={[styles.hourInput, { backgroundColor: colors.muted, color: colors.foreground, flex: 1 }]}
              value={h.time}
              onChangeText={(v) => setHours((prev) => prev.map((x, j) => j === i ? { ...x, time: v } : x))}
            />
          </View>
        ))}
        <SaveButton onSave={() => updateConfig({ hours })} colors={colors} />
      </View>
    </View>
  );
}

function StatsTab({ colors, config, updateConfig }: any) {
  const [stats, setStats] = useState([...config.stats]);
  return (
    <View style={{ gap: 4 }}>
      <SectionTitle title="Chiffres clés (accueil)" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {stats.map((s: any, i: number) => (
          <View key={i} style={styles.hourRow}>
            <TextInput
              style={[styles.hourInput, { backgroundColor: colors.muted, color: colors.foreground, flex: 1 }]}
              value={s.value}
              onChangeText={(v) => setStats((prev) => prev.map((x, j) => j === i ? { ...x, value: v } : x))}
              placeholder="500+"
              placeholderTextColor={colors.mutedForeground}
            />
            <TextInput
              style={[styles.hourInput, { backgroundColor: colors.muted, color: colors.foreground, flex: 2 }]}
              value={s.label}
              onChangeText={(v) => setStats((prev) => prev.map((x, j) => j === i ? { ...x, label: v } : x))}
              placeholder="Label"
              placeholderTextColor={colors.mutedForeground}
            />
          </View>
        ))}
        <SaveButton onSave={() => updateConfig({ stats })} colors={colors} />
      </View>
    </View>
  );
}

function SecurityTab({ colors, config, updateConfig, resetConfig }: any) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  async function changePin() {
    if (currentPin !== config.adminPin) {
      Alert.alert("Erreur", "Code PIN actuel incorrect");
      return;
    }
    if (newPin.length < 4) {
      Alert.alert("Erreur", "Le nouveau PIN doit faire au moins 4 chiffres");
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert("Erreur", "Les deux nouveaux codes ne correspondent pas");
      return;
    }
    await updateConfig({ adminPin: newPin });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentPin(""); setNewPin(""); setConfirmPin("");
    Alert.alert("✅ Succès", "Code PIN modifié avec succès");
  }

  return (
    <View style={{ gap: 12 }}>
      <SectionTitle title="Modifier le code PIN admin" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <FieldInput label="PIN actuel" value={currentPin} onChangeText={setCurrentPin} colors={colors} keyboardType="numeric" />
        <FieldInput label="Nouveau PIN" value={newPin} onChangeText={setNewPin} colors={colors} keyboardType="numeric" />
        <FieldInput label="Confirmer le nouveau PIN" value={confirmPin} onChangeText={setConfirmPin} colors={colors} keyboardType="numeric" />
        <Pressable
          onPress={changePin}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <Feather name="key" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>Changer le PIN</Text>
        </Pressable>
      </View>

      <SectionTitle title="Réinitialisation" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.resetDesc, { color: colors.mutedForeground }]}>
          Remet toutes les configurations par défaut (irréversible).
        </Text>
        <Pressable
          onPress={() =>
            Alert.alert(
              "Réinitialiser ?",
              "Toutes vos configurations seront perdues. Cette action est irréversible.",
              [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Réinitialiser",
                  style: "destructive",
                  onPress: () => {
                    resetConfig();
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  },
                },
              ]
            )
          }
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.destructive, opacity: pressed ? 0.85 : 1 }]}
        >
          <Feather name="trash-2" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>Réinitialiser la configuration</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pinContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  pinCard: {
    width: "100%", maxWidth: 360, borderRadius: 20, borderWidth: 1,
    padding: 28, alignItems: "center", gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  pinIcon: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  pinTitle: { fontFamily: "Inter_700Bold", fontSize: 22 },
  pinSubtitle: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 20 },
  pinInput: {
    width: "100%", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 20, fontFamily: "Inter_600SemiBold", textAlign: "center",
    letterSpacing: 8, borderWidth: 1.5, marginTop: 8,
  },
  pinError: { fontFamily: "Inter_400Regular", fontSize: 13 },
  pinBtn: { width: "100%", borderRadius: 14, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  pinBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  pinHint: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 4 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 20, color: "#fff" },

  tabBar: { borderBottomWidth: 1 },
  tabBarInner: { paddingHorizontal: 8, paddingVertical: 4, gap: 4 },
  tabItem: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 10,
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },

  card: {
    borderRadius: 16, borderWidth: 1, padding: 16, gap: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 11, letterSpacing: 1, marginTop: 8, marginBottom: -4 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  fieldInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular", borderWidth: 1 },
  fieldTextarea: { height: 80, paddingTop: 10 },
  saveBtn: { borderRadius: 12, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  saveBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  serviceChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  serviceChipText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  hourRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  hourInput: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  resetDesc: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 20 },
});
