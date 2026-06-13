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

const SERVICES_OPTIONS = [
  "Panneaux Solaires",
  "Démoussage de Toit",
  "Nettoyage de Façade",
  "Bardage & Bas Acier",
  "Plusieurs services",
];

interface FormData {
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  codePostal: string;
  service: string;
  message: string;
}

const INITIAL_FORM: FormData = {
  nom: "",
  telephone: "",
  email: "",
  adresse: "",
  codePostal: "",
  service: "",
  message: "",
};

export default function DevisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  function validate(): boolean {
    const newErrors: Partial<FormData> = {};
    if (!form.nom.trim()) newErrors.nom = "Nom requis";
    if (!form.telephone.trim()) newErrors.telephone = "Téléphone requis";
    if (!form.email.trim() || !form.email.includes("@")) newErrors.email = "Email invalide";
    if (!form.adresse.trim()) newErrors.adresse = "Adresse requise";
    if (!form.service) newErrors.service = "Sélectionnez un service";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setLoading(true);
    try {
      const devis = {
        ...form,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
      };
      const existing = await AsyncStorage.getItem("devis_list");
      const list = existing ? JSON.parse(existing) : [];
      list.push(devis);
      await AsyncStorage.setItem("devis_list", JSON.stringify(list));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSubmitted(true);
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer votre demande. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <View
        style={[
          styles.successContainer,
          { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad },
        ]}
      >
        <View style={[styles.successIcon, { backgroundColor: colors.accent + "20" }]}>
          <Feather name="check-circle" size={56} color={colors.accent} />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          Demande envoyée !
        </Text>
        <Text style={[styles.successText, { color: colors.mutedForeground }]}>
          Merci {form.nom.split(" ")[0]} ! Nous avons bien reçu votre demande de devis. Notre équipe vous contactera dans les 24h ouvrées.
        </Text>
        <Pressable
          onPress={() => {
            setForm(INITIAL_FORM);
            setSubmitted(false);
            setErrors({});
          }}
          style={({ pressed }) => [
            styles.newDevisBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.newDevisBtnText}>Nouvelle demande</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingBottom: bottomPad + 24,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Demande de Devis</Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
        Remplissez ce formulaire et nous vous rappelons sous 24h
      </Text>

      {/* Form Card */}
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>

        <Field label="Nom complet *" error={errors.nom}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.nom ? colors.destructive : "transparent" }]}
            placeholder="Jean Dupont"
            placeholderTextColor={colors.mutedForeground}
            value={form.nom}
            onChangeText={(v) => setForm((f) => ({ ...f, nom: v }))}
            autoCapitalize="words"
          />
        </Field>

        <Field label="Téléphone *" error={errors.telephone}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.telephone ? colors.destructive : "transparent" }]}
            placeholder="06 12 34 56 78"
            placeholderTextColor={colors.mutedForeground}
            value={form.telephone}
            onChangeText={(v) => setForm((f) => ({ ...f, telephone: v }))}
            keyboardType="phone-pad"
          />
        </Field>

        <Field label="Email *" error={errors.email}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.email ? colors.destructive : "transparent" }]}
            placeholder="jean.dupont@email.fr"
            placeholderTextColor={colors.mutedForeground}
            value={form.email}
            onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>

        <Field label="Adresse du chantier *" error={errors.adresse}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: errors.adresse ? colors.destructive : "transparent" }]}
            placeholder="12 rue de la Paix"
            placeholderTextColor={colors.mutedForeground}
            value={form.adresse}
            onChangeText={(v) => setForm((f) => ({ ...f, adresse: v }))}
          />
        </Field>

        <Field label="Code postal">
          <TextInput
            style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: "transparent" }]}
            placeholder="75000"
            placeholderTextColor={colors.mutedForeground}
            value={form.codePostal}
            onChangeText={(v) => setForm((f) => ({ ...f, codePostal: v }))}
            keyboardType="number-pad"
            maxLength={5}
          />
        </Field>

        {/* Service selector */}
        <Field label="Service souhaité *" error={errors.service}>
          <View style={styles.serviceGrid}>
            {SERVICES_OPTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => setForm((f) => ({ ...f, service: s }))}
                style={({ pressed }) => [
                  styles.serviceChip,
                  {
                    backgroundColor:
                      form.service === s ? colors.primary : colors.muted,
                    borderColor:
                      form.service === s ? colors.primary : "transparent",
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.serviceChipText,
                    { color: form.service === s ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
          {errors.service ? (
            <Text style={[styles.errorText, { color: colors.destructive }]}>{errors.service}</Text>
          ) : null}
        </Field>

        <Field label="Message / Précisions">
          <TextInput
            style={[
              styles.input,
              styles.textarea,
              { backgroundColor: colors.muted, color: colors.foreground, borderColor: "transparent" },
            ]}
            placeholder="Surface approximative, particularités du chantier..."
            placeholderTextColor={colors.mutedForeground}
            value={form.message}
            onChangeText={(v) => setForm((f) => ({ ...f, message: v }))}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </Field>

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: colors.primary, opacity: pressed || loading ? 0.8 : 1 },
          ]}
        >
          {loading ? (
            <Text style={styles.submitBtnText}>Envoi en cours...</Text>
          ) : (
            <>
              <Feather name="send" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Envoyer ma demande</Text>
            </>
          )}
        </Pressable>

        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Devis gratuit et sans engagement. Réponse sous 24h ouvrées.
        </Text>
      </View>
    </ScrollView>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={styles.fieldWrapper}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      {children}
      {error ? (
        <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 28,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldWrapper: {
    marginBottom: 12,
    gap: 6,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    borderWidth: 1.5,
  },
  textarea: {
    height: 90,
    paddingTop: 12,
  },
  errorText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  serviceChipText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  submitBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  disclaimer: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    marginBottom: 12,
    textAlign: "center",
  },
  successText: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  newDevisBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  newDevisBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
