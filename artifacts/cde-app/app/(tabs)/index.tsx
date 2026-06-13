import React from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { ServiceCard } from "@/components/ServiceCard";

const SERVICES_PREVIEW = [
  {
    id: "solaire",
    title: "Panneaux Solaires",
    description: "Nettoyage professionnel de vos panneaux photovoltaïques pour maximiser leur rendement.",
    accentColor: "#F59E0B",
    icon: "sun",
  },
  {
    id: "toit",
    title: "Démoussage de Toit",
    description: "Traitement complet contre le mousse et les lichens pour prolonger la durée de vie de votre toiture.",
    accentColor: "#10B981",
    icon: "home",
  },
  {
    id: "facade",
    title: "Nettoyage de Façade",
    description: "Ravalement et nettoyage haute pression de vos façades pour redonner éclat à votre bâtiment.",
    accentColor: "#3B82F6",
    icon: "layers",
  },
  {
    id: "bardage",
    title: "Bardage & Bas Acier",
    description: "Pose, entretien et traitement de bardages et bas acier pour une finition durable et esthétique.",
    accentColor: "#6366F1",
    icon: "grid",
  },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HERO */}
      <View
        style={[
          styles.hero,
          {
            paddingTop: topPad + 20,
            backgroundColor: colors.primary,
          },
        ]}
      >
        <View style={styles.heroInner}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.heroLogo}
            resizeMode="contain"
          />
          <Text style={styles.heroTitle}>CDE</Text>
          <Text style={styles.heroSubtitle}>Nettoyage & Entretien</Text>
          <Text style={styles.heroTagline}>
            Experts en propreté extérieure{"\n"}au service de votre habitat
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)/devis")}
            style={({ pressed }) => [
              styles.heroBtn,
              { opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text style={styles.heroBtnText}>Demander un devis gratuit</Text>
          </Pressable>
        </View>

        {/* Wave */}
        <View style={[styles.wave, { backgroundColor: colors.background }]} />
      </View>

      {/* STATS ROW */}
      <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
        {[
          { label: "Clients satisfaits", value: "500+" },
          { label: "Années d'expérience", value: "10+" },
          { label: "Interventions / an", value: "800+" },
        ].map((s) => (
          <View key={s.label} style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* SECTION TITLE */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Nos Services</Text>
        <Pressable onPress={() => router.push("/(tabs)/services")}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>Voir tout →</Text>
        </Pressable>
      </View>

      {/* SERVICE CARDS (compact) */}
      <View style={styles.gridRow}>
        {SERVICES_PREVIEW.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push("/(tabs)/services")}
            style={({ pressed }) => [
              styles.miniCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <View style={[styles.miniIcon, { backgroundColor: s.accentColor + "20" }]}>
              <Feather name={s.icon as any} size={22} color={s.accentColor} />
            </View>
            <Text style={[styles.miniTitle, { color: colors.foreground }]}>{s.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* WHY US */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pourquoi nous choisir ?</Text>
      </View>

      <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: "check-circle" as const, text: "Intervention rapide sous 48h" },
          { icon: "shield" as const, text: "Produits certifiés écologiques" },
          { icon: "award" as const, text: "Devis gratuit et sans engagement" },
          { icon: "users" as const, text: "Équipe formée et assurée" },
          { icon: "star" as const, text: "Satisfaction garantie" },
        ].map((item) => (
          <View key={item.text} style={styles.whyItem}>
            <Feather name={item.icon} size={18} color={colors.accent} />
            <Text style={[styles.whyText, { color: colors.foreground }]}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* CTA BOTTOM */}
      <Pressable
        onPress={() => router.push("/(tabs)/contact")}
        style={({ pressed }) => [
          styles.ctaBottom,
          { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1, marginHorizontal: 16, marginBottom: 8 },
        ]}
      >
        <Feather name="phone" size={18} color="#fff" />
        <Text style={styles.ctaBottomText}>Nous contacter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingBottom: 0,
  },
  heroInner: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  heroLogo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 36,
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  heroSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  heroTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  heroBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  heroBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#1565C0",
  },
  wave: {
    height: 32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    marginTop: 0,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 22,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  sectionLink: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  gridRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 8,
  },
  miniCard: {
    width: "47%",
    marginHorizontal: "1.5%",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "flex-start",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  miniIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  miniTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    lineHeight: 18,
  },
  whyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  whyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  whyText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    flex: 1,
  },
  ctaBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
  },
  ctaBottomText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
