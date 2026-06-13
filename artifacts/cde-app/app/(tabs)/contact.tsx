import * as Haptics from "expo-haptics";
import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const CONTACT_INFO = {
  phone: "06 00 00 00 00",
  email: "contact@cde-nettoyage.fr",
  address: "France",
  hours: [
    { day: "Lundi – Vendredi", time: "8h00 – 18h00" },
    { day: "Samedi", time: "9h00 – 14h00" },
    { day: "Dimanche", time: "Fermé" },
  ],
};

async function openPhone() {
  const url = `tel:${CONTACT_INFO.phone.replace(/\s/g, "")}`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  } else {
    Alert.alert("Téléphone", CONTACT_INFO.phone);
  }
}

async function openEmail() {
  const url = `mailto:${CONTACT_INFO.email}?subject=Demande d'information CDE`;
  const supported = await Linking.canOpenURL(url);
  if (supported) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
  } else {
    Alert.alert("Email", CONTACT_INFO.email);
  }
}

export default function ContactScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 16,
        paddingBottom: bottomPad + 24,
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground }]}>Contact</Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, marginBottom: 28 }]}>
        Notre équipe est disponible pour répondre à toutes vos questions
      </Text>

      {/* Contact Buttons */}
      <View style={styles.contactBtns}>
        <Pressable
          onPress={openPhone}
          style={({ pressed }) => [
            styles.contactBtn,
            { backgroundColor: "#1565C0", opacity: pressed ? 0.85 : 1, flex: 1 },
          ]}
        >
          <Feather name="phone" size={22} color="#fff" />
          <Text style={styles.contactBtnText}>Appeler</Text>
          <Text style={styles.contactBtnSub}>{CONTACT_INFO.phone}</Text>
        </Pressable>

        <Pressable
          onPress={openEmail}
          style={({ pressed }) => [
            styles.contactBtn,
            { backgroundColor: "#2E7D32", opacity: pressed ? 0.85 : 1, flex: 1 },
          ]}
        >
          <Feather name="mail" size={22} color="#fff" />
          <Text style={styles.contactBtnText}>Email</Text>
          <Text style={styles.contactBtnSub} numberOfLines={1}>Écrire un mail</Text>
        </Pressable>
      </View>

      {/* Info Card */}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Informations</Text>

        <InfoRow icon="map-pin" label="Zone d'intervention" value="France métropolitaine" colors={colors} />
        <InfoRow icon="mail" label="Email" value={CONTACT_INFO.email} colors={colors} />
        <InfoRow icon="phone" label="Téléphone" value={CONTACT_INFO.phone} colors={colors} />
      </View>

      {/* Hours */}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Horaires d'ouverture</Text>
        {CONTACT_INFO.hours.map((h) => (
          <View key={h.day} style={[styles.hourRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.hourDay, { color: colors.foreground }]}>{h.day}</Text>
            <Text
              style={[
                styles.hourTime,
                { color: h.time === "Fermé" ? colors.destructive : colors.accent },
              ]}
            >
              {h.time}
            </Text>
          </View>
        ))}
      </View>

      {/* Urgence */}
      <View
        style={[
          styles.urgenceCard,
          { backgroundColor: "#FFF3CD", borderColor: "#F59E0B" },
        ]}
      >
        <Feather name="alert-circle" size={20} color="#F59E0B" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.urgenceTitle, { color: "#92400E" }]}>Intervention urgente ?</Text>
          <Text style={[styles.urgenceText, { color: "#92400E" }]}>
            Contactez-nous directement par téléphone pour toute urgence. Nous faisons notre possible pour intervenir rapidement.
          </Text>
        </View>
      </View>

      {/* CTA Devis */}
      <Pressable
        onPress={() => router.push("/(tabs)/devis")}
        style={({ pressed }) => [
          styles.devisBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Feather name="file-text" size={20} color="#fff" />
        <Text style={styles.devisBtnText}>Demander un devis gratuit</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: string;
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.muted }]}>
        <Feather name={icon as any} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
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
  },
  contactBtns: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  contactBtn: {
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  contactBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  contactBtnSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  infoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  hourRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  hourDay: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
  },
  hourTime: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  urgenceCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 20,
  },
  urgenceTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    marginBottom: 4,
  },
  urgenceText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  devisBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  devisBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
