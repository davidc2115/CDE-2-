import React, { useState } from "react";
import {
  Image,
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

const SERVICES = [
  {
    id: "solaire",
    title: "Panneaux Solaires",
    subtitle: "Maximisez votre rendement énergétique",
    description:
      "Un panneau solaire encrassé peut perdre jusqu'à 30% de rendement. Notre équipe intervient avec des produits adaptés et du matériel professionnel pour nettoyer vos panneaux photovoltaïques en toute sécurité.",
    points: [
      "Nettoyage haute pression douce",
      "Produits déminéralisés respectueux des cellules",
      "Vérification des connexions visibles",
      "Rapport d'intervention fourni",
    ],
    accentColor: "#F59E0B",
    icon: "sun",
    image: require("../../assets/images/icon.png"),
  },
  {
    id: "toit",
    title: "Démoussage de Toit",
    subtitle: "Protégez votre toiture dans la durée",
    description:
      "Le mousse et les lichens retiennent l'humidité et accélèrent la dégradation de vos tuiles. Notre traitement anti-mousse professionnel nettoie et protège votre toiture pour plusieurs années.",
    points: [
      "Traitement préventif et curatif",
      "Brossage manuel ou haute pression",
      "Application de produit hydrofuge",
      "Nettoyage des gouttières inclus",
    ],
    accentColor: "#10B981",
    icon: "home",
    image: require("../../assets/images/icon.png"),
  },
  {
    id: "facade",
    title: "Nettoyage de Façade",
    subtitle: "Redonnez vie à vos murs extérieurs",
    description:
      "Pollution, moisissures, traces vertes... Nos experts redonnent à vos façades un aspect neuf grâce à des techniques adaptées à chaque type de revêtement : pierre, crépi, brique, béton.",
    points: [
      "Basse pression ou hydrogommage",
      "Traitement anti-algues et anti-mousse",
      "Respectueux du revêtement",
      "Résultat immédiat et durable",
    ],
    accentColor: "#3B82F6",
    icon: "layers",
    image: require("../../assets/images/icon.png"),
  },
  {
    id: "bardage",
    title: "Bardage & Bas Acier",
    subtitle: "Finitions professionnelles et durables",
    description:
      "Nous intervenons sur l'ensemble de vos travaux de bardage et bas acier : pose, remplacement, traitement anticorrosion et entretien. Nos équipes maîtrisent les matériaux modernes pour un rendu esthétique et performant.",
    points: [
      "Bardage bois, composite, métallique",
      "Traitement anticorrosion bas acier",
      "Remplacement de panneaux détériorés",
      "Finitions soignées et garanties",
    ],
    accentColor: "#6366F1",
    icon: "grid",
    image: require("../../assets/images/icon.png"),
  },
];

export default function ServicesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
      <Text style={[styles.pageSubtitle, { color: colors.mutedForeground, paddingHorizontal: 16, marginBottom: 24 }]}>
        Des solutions professionnelles pour l'entretien de votre habitat
      </Text>

      {SERVICES.map((service) => {
        const isOpen = expanded === service.id;
        return (
          <View
            key={service.id}
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: isOpen ? service.accentColor : colors.border,
                borderRadius: 18,
                marginHorizontal: 16,
                marginBottom: 16,
              },
            ]}
          >
            {/* Header */}
            <Pressable
              onPress={() => setExpanded(isOpen ? null : service.id)}
              style={({ pressed }) => [styles.cardHeader, { opacity: pressed ? 0.85 : 1 }]}
            >
              <View style={[styles.iconBadge, { backgroundColor: service.accentColor + "20" }]}>
                <Feather name={service.icon as any} size={24} color={service.accentColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{service.title}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.mutedForeground }]}>{service.subtitle}</Text>
              </View>
              <Feather
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.mutedForeground}
              />
            </Pressable>

            {/* Expanded */}
            {isOpen && (
              <View style={[styles.cardBody, { borderTopColor: colors.border }]}>
                <Text style={[styles.cardDescription, { color: colors.foreground }]}>
                  {service.description}
                </Text>

                <Text style={[styles.pointsTitle, { color: colors.mutedForeground }]}>
                  Ce qui est inclus :
                </Text>
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
                  <Text style={styles.devisBtnText}>Demander un devis pour ce service</Text>
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
  card: {
    borderWidth: 1.5,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    paddingTop: 14,
    gap: 10,
  },
  cardDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 21,
  },
  pointsTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    marginTop: 4,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pointText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    flex: 1,
  },
  devisBtn: {
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 8,
  },
  devisBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    color: "#FFFFFF",
  },
});
