import React from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface ServiceCardProps {
  title: string;
  description: string;
  image?: ImageSourcePropType;
  iconName?: string;
  accentColor?: string;
  onPress?: () => void;
  compact?: boolean;
}

export function ServiceCard({
  title,
  description,
  image,
  accentColor,
  onPress,
  compact = false,
}: ServiceCardProps) {
  const colors = useColors();
  const accent = accentColor ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          shadowColor: "#000",
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {image && !compact && (
        <Image
          source={image}
          style={[styles.image, { borderTopLeftRadius: 16, borderTopRightRadius: 16 }]}
          resizeMode="cover"
        />
      )}
      <View style={[styles.body, { padding: compact ? 12 : 16 }]}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <Text
          style={[
            styles.title,
            { color: colors.foreground, fontSize: compact ? 15 : 17 },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          style={[styles.description, { color: colors.mutedForeground }]}
          numberOfLines={compact ? 2 : 3}
        >
          {description}
        </Text>
        {onPress && !compact && (
          <View style={[styles.cta, { backgroundColor: accent + "18" }]}>
            <Text style={[styles.ctaText, { color: accent }]}>En savoir plus →</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#E0E7EF",
  },
  body: {
    gap: 8,
  },
  accentBar: {
    width: 32,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_700Bold",
    lineHeight: 22,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  cta: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  ctaText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
});
