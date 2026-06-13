import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface ServiceConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: string;
  priceUnit: string;
  accentColor: string;
  icon: string;
  points: string[];
}

export interface AppConfig {
  company: {
    name: string;
    tagline: string;
    description: string;
    phone: string;
    email: string;
    address: string;
    zone: string;
  };
  home: {
    heroBadge: string;
    ctaLabel: string;
    whyUsTitle: string;
    whyUsPoints: string[];
    droneTitle: string;
    droneSubtitle: string;
    droneModel: string;
    dronePoints: string[];
  };
  hours: Array<{ day: string; time: string }>;
  services: ServiceConfig[];
  stats: Array<{ label: string; value: string }>;
  adminPin: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  adminPin: "1234",
  company: {
    name: "CDE",
    tagline: "Nettoyage & Entretien",
    description:
      "Experts en propreté extérieure par drone\nau service de votre habitat",
    phone: "06 00 00 00 00",
    email: "contact@cde-nettoyage.fr",
    address: "France",
    zone: "France métropolitaine",
  },
  home: {
    heroBadge: "DJI Matrice 350 RTK",
    ctaLabel: "Demander un devis gratuit",
    whyUsTitle: "Pourquoi nous choisir ?",
    whyUsPoints: [
      "Technologie drone DJI Matrice 350 RTK de pointe",
      "Aucun risque pour vos toitures et installations",
      "Intervention rapide sans échafaudage",
      "Rapport d'intervention photo/vidéo 4K inclus",
      "Produits écologiques et certifiés",
    ],
    droneTitle: "Notre technologie",
    droneSubtitle: "DJI Matrice 350 RTK",
    droneModel: "Drone professionnel certifié S1",
    dronePoints: [
      "Positionnement centimétrique RTK",
      "Caméra 4K intégrée pour rapports",
      "Autonomie 55 min / charge utile 2,7 kg",
      "Certifié vol professionnel (DGAC)",
    ],
  },
  stats: [
    { label: "Clients satisfaits", value: "500+" },
    { label: "Années d'expérience", value: "10+" },
    { label: "Interventions / an", value: "800+" },
  ],
  hours: [
    { day: "Lundi – Vendredi", time: "8h00 – 18h00" },
    { day: "Samedi", time: "9h00 – 14h00" },
    { day: "Dimanche", time: "Fermé" },
  ],
  services: [
    {
      id: "solaire",
      title: "Panneaux Solaires",
      subtitle: "Maximisez votre rendement énergétique par drone",
      description:
        "Grâce au DJI Matrice 350 RTK, nous nettoyons vos panneaux photovoltaïques avec une précision millimétrique et sans aucun risque pour vos installations. Un panneau encrassé peut perdre jusqu'à 30% de rendement.",
      price: "Sur devis",
      priceUnit: "",
      accentColor: "#F59E0B",
      icon: "sun",
      points: [
        "Drone DJI Matrice 350 RTK certifié",
        "Nettoyage haute pression douce",
        "Produits déminéralisés adaptés",
        "Rapport d'intervention fourni",
        "Zéro risque pour vos toitures",
      ],
    },
    {
      id: "toit",
      title: "Démoussage de Toit",
      subtitle: "Traitement aérien sans intervention en hauteur",
      description:
        "Notre drone DJI Matrice 350 RTK détecte et traite le mousse, les lichens et les algues avec une précision chirurgicale. Aucun échafaudage, aucun risque de chute, intervention rapide et efficace.",
      price: "Sur devis",
      priceUnit: "",
      accentColor: "#10B981",
      icon: "home",
      points: [
        "Inspection thermique préalable par drone",
        "Traitement anti-mousse par pulvérisation aérienne",
        "Application de produit hydrofuge",
        "Nettoyage des gouttières inclus",
        "Aucun dommage sur la toiture",
      ],
    },
    {
      id: "facade",
      title: "Nettoyage de Façade",
      subtitle: "Haute précision aérienne sur tous types de revêtements",
      description:
        "Le DJI Matrice 350 RTK permet d'atteindre chaque recoin de vos façades, même les plus complexes. Pollution, moisissures, traces vertes : nos équipes aériennes redonnent vie à vos murs extérieurs.",
      price: "Sur devis",
      priceUnit: "",
      accentColor: "#3B82F6",
      icon: "layers",
      points: [
        "Accès aux zones difficiles d'accès",
        "Nettoyage haute pression ou hydrogommage aérien",
        "Traitement anti-algues et anti-mousse",
        "Tous types de revêtements (pierre, crépi, brique)",
        "Résultat immédiat et durable",
      ],
    },
    {
      id: "bardage",
      title: "Bardage & Bas Acier",
      subtitle: "Inspection et traitement aérien professionnel",
      description:
        "Notre drone inspecte et traite l'ensemble de vos bardages et bas acier avec une précision sans égale. Anticorrosion, remplacement de panneaux, finitions : une intervention complète et sécurisée.",
      price: "Sur devis",
      priceUnit: "",
      accentColor: "#6366F1",
      icon: "grid",
      points: [
        "Inspection aérienne 4K complète",
        "Bardage bois, composite, métallique",
        "Traitement anticorrosion bas acier",
        "Remplacement de panneaux détériorés",
        "Rapport photos/vidéos fourni",
      ],
    },
  ],
};

const STORAGE_KEY = "cde_app_config";

interface AppConfigContextType {
  config: AppConfig;
  updateConfig: (updates: Partial<AppConfig>) => Promise<void>;
  updateService: (id: string, updates: Partial<ServiceConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
  loaded: boolean;
}

const AppConfigContext = createContext<AppConfigContextType>({
  config: DEFAULT_CONFIG,
  updateConfig: async () => {},
  updateService: async () => {},
  resetConfig: async () => {},
  loaded: false,
});

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw);
          setConfig((prev) => deepMerge(prev, saved));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback(async (next: AppConfig) => {
    setConfig(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateConfig = useCallback(
    async (updates: Partial<AppConfig>) => {
      const next = deepMerge(config, updates) as AppConfig;
      await persist(next);
    },
    [config, persist]
  );

  const updateService = useCallback(
    async (id: string, updates: Partial<ServiceConfig>) => {
      const services = config.services.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      );
      await persist({ ...config, services });
    },
    [config, persist]
  );

  const resetConfig = useCallback(async () => {
    setConfig(DEFAULT_CONFIG);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AppConfigContext.Provider value={{ config, updateConfig, updateService, resetConfig, loaded }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}

function deepMerge(target: any, source: any): any {
  if (Array.isArray(source)) return source;
  if (typeof source !== "object" || source === null) return source ?? target;
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === "object" &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof target[key] === "object" &&
      target[key] !== null
    ) {
      result[key] = deepMerge(target[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
