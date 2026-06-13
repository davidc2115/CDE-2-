import React, { useState } from "react";
import {
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
import { useAppConfig } from "@/contexts/AppConfigContext";

const SERVICE_ICONS: Record<string, string> = {
  solaire: "sun",
  toit: "home",
  facade: "layers",
  bardage: "grid",
};

export default function ServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { config } = useAppConfig();
  const [expanded, setExpanded] = useState<string | null>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad + 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.pageTitle, { color: colors.foreground, paddingHorizontal: 16 }]}>
        Nos Services
      </Text>
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, paddingHorizontal: 16 }]}>
        Toutes nos interventions sont réalisées par drone
      </Text>

      {/* Drone badge */}
      <View style={[styles.droneBanner, { backgroundColor: "#0A1628" }]}>
        <Feather name="wind" size={20} color="#F59E0B" />
        <View style={{ flex: 1 }}>
          <Text style={styles.droneBannerTitle}>DJI Matrice 350 RTK</Text>
          <Text style={styles.droneBannerSub}>
            Drone industriel certifié · Précision centimétrique · Zéro risque
          </Text>
        </View>
      </View>

      {/* Services */}
      {config.services.map((service) => {
        const isOpen = expanded === service.id;
        const icon = SERVICE_ICONS[service.id] ?? "tool";
        return (
          <View
            key={service.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: isOpen ? service.accentColor : colors.border,
                marginHorizontal: 16,
                marginBottom: 16,
              },
            ]}
          >
            <Pressable
              onPress={() => setExpanded(isOpen ? null : service.id)}
              style={({ pressed }) => [styles.cardHeader, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: service.accentColor + "20" }]}>
                <Feather name={icon as any} size={24} color={service.accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{service.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{service.subtitle}</Text>
                {service.price && service.price !== "Sur devis" ? (
                  <Text style={[styles.cardPrice, { color: service.accentColor }]}>
                    À partir de {service.price}{service.priceUnit}
                  </Text>
                ) : (
                  <Text style={[styles.cardPrice, { color: colors.mutedForeground }]}>Sur devis</Text>
                )}
              </View>
              <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.mutedForeground} />
            </Pressable>

            {isOpen && (
              <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                <Text style={[styles.cardDescription, { color: colors.foreground }]}>
                  {service.description}
                </Text>

                <Text style={[styles.pointsTitle, { color: colors.mutedForeground }]}>Ce qui est inclus :</Text>
                {service.points.map((point) => (
                  <View key={point} style={styles.pointRow}>
                    <Feather name="check" size={15} color={service.accentColor} />
                    <Text style={[styles.pointText, { color: colors.foreground }]}>{point}</Text>
                  </View>
                ))}

                <Pressable
                  onPress={() => router.push("/(tabs)/devis")}
                  style={({ pressed }) => [
                    styles.devisBtn,
                    { backgroundColor: service.accentColor, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Text style={styles.devisBtnText}>Demander un devis</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 4 },
  pageSubtitle: { fontFamily: "Inter_400Regular", fontSize: 15, lineHeight: 22, marginBottom: 16 },
  droneBanner: {
    flexDirection: "row", alignItems: "center", gap: 14,
    marginHorizontal: 16, marginBottom: 20, padding: 16, borderRadius: 14,
  },
  droneBannerTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#FFFFFF" },
  droneBannerSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 },
  card: {
    borderWidth: 1.5, borderRadius: 18, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  iconBadge: { width: 50, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 2 },
  cardSubtitle: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 4 },
  cardPrice: { fontFamily: "Inter_700Bold", fontSize: 13 },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16, borderTopWidth: 1, paddingTop: 14, gap: 10 },
  cardDescription: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 21 },
  pointsTitle: { fontFamily: "Inter_600SemiBold", fontSize: 13, marginTop: 4 },
  pointRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pointText: { fontFamily: "Inter_400Regular", fontSize: 14, flex: 1 },
  devisBtn: { borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 8 },
  devisBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: "#FFFFFF" },
});
