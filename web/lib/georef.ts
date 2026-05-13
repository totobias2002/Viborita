export interface GeoRefPlaceSuggestion {
  id: string;
  label: string;
  subtitle: string;
  lat: number;
  lng: number;
}

const CABA_NEIGHBORHOODS: GeoRefPlaceSuggestion[] = [
  { id: "caba-agronomia", label: "Agronomia", subtitle: "Barrio, CABA, Argentina", lat: -34.6007, lng: -58.4901 },
  { id: "caba-almagro", label: "Almagro", subtitle: "Barrio, CABA, Argentina", lat: -34.6103, lng: -58.4217 },
  { id: "caba-balvanera", label: "Balvanera", subtitle: "Barrio, CABA, Argentina", lat: -34.6094, lng: -58.406 },
  { id: "caba-belgrano", label: "Belgrano", subtitle: "Barrio, CABA, Argentina", lat: -34.5627, lng: -58.4566 },
  { id: "caba-boedo", label: "Boedo", subtitle: "Barrio, CABA, Argentina", lat: -34.6333, lng: -58.4122 },
  { id: "caba-caballito", label: "Caballito", subtitle: "Barrio, CABA, Argentina", lat: -34.6203, lng: -58.4424 },
  { id: "caba-chacarita", label: "Chacarita", subtitle: "Barrio, CABA, Argentina", lat: -34.5872, lng: -58.4552 },
  { id: "caba-coghlan", label: "Coghlan", subtitle: "Barrio, CABA, Argentina", lat: -34.5599, lng: -58.4747 },
  { id: "caba-colegiales", label: "Colegiales", subtitle: "Barrio, CABA, Argentina", lat: -34.5735, lng: -58.4495 },
  { id: "caba-flores", label: "Flores", subtitle: "Barrio, CABA, Argentina", lat: -34.6322, lng: -58.4607 },
  { id: "caba-floresta", label: "Floresta", subtitle: "Barrio, CABA, Argentina", lat: -34.6274, lng: -58.4845 },
  { id: "caba-liniers", label: "Liniers", subtitle: "Barrio, CABA, Argentina", lat: -34.6425, lng: -58.5277 },
  { id: "caba-mataderos", label: "Mataderos", subtitle: "Barrio, CABA, Argentina", lat: -34.6565, lng: -58.5012 },
  { id: "caba-monte-castro", label: "Monte Castro", subtitle: "Barrio, CABA, Argentina", lat: -34.6193, lng: -58.5034 },
  { id: "caba-monserrat", label: "Monserrat", subtitle: "Barrio, CABA, Argentina", lat: -34.6111, lng: -58.3817 },
  { id: "caba-nunez", label: "Nunez", subtitle: "Barrio, CABA, Argentina", lat: -34.5453, lng: -58.4658 },
  { id: "caba-palermo", label: "Palermo", subtitle: "Barrio, CABA, Argentina", lat: -34.5795, lng: -58.4306 },
  { id: "caba-parque-chas", label: "Parque Chas", subtitle: "Barrio, CABA, Argentina", lat: -34.5858, lng: -58.4858 },
  { id: "caba-parque-patricios", label: "Parque Patricios", subtitle: "Barrio, CABA, Argentina", lat: -34.6362, lng: -58.4011 },
  { id: "caba-paternal", label: "Paternal", subtitle: "Barrio, CABA, Argentina", lat: -34.5957, lng: -58.4712 },
  { id: "caba-pompeya", label: "Nueva Pompeya", subtitle: "Barrio, CABA, Argentina", lat: -34.6494, lng: -58.4178 },
  { id: "caba-recoleta", label: "Recoleta", subtitle: "Barrio, CABA, Argentina", lat: -34.5875, lng: -58.3974 },
  { id: "caba-retiro", label: "Retiro", subtitle: "Barrio, CABA, Argentina", lat: -34.5924, lng: -58.3759 },
  { id: "caba-saavedra", label: "Saavedra", subtitle: "Barrio, CABA, Argentina", lat: -34.5547, lng: -58.4919 },
  { id: "caba-san-cristobal", label: "San Cristobal", subtitle: "Barrio, CABA, Argentina", lat: -34.6226, lng: -58.3971 },
  { id: "caba-san-telmo", label: "San Telmo", subtitle: "Barrio, CABA, Argentina", lat: -34.6217, lng: -58.3734 },
  { id: "caba-villa-crespo", label: "Villa Crespo", subtitle: "Barrio, CABA, Argentina", lat: -34.5984, lng: -58.4434 },
  { id: "caba-villa-del-parque", label: "Villa del Parque", subtitle: "Barrio, CABA, Argentina", lat: -34.6018, lng: -58.4941 },
  { id: "caba-villa-devoto", label: "Villa Devoto", subtitle: "Barrio, CABA, Argentina", lat: -34.6026, lng: -58.5106 },
  { id: "caba-villa-general-mitre", label: "Villa General Mitre", subtitle: "Barrio, CABA, Argentina", lat: -34.6124, lng: -58.4684 },
  { id: "caba-villa-lugano", label: "Villa Lugano", subtitle: "Barrio, CABA, Argentina", lat: -34.6798, lng: -58.4745 },
  { id: "caba-villa-luro", label: "Villa Luro", subtitle: "Barrio, CABA, Argentina", lat: -34.6398, lng: -58.5015 },
  { id: "caba-villa-ortuzar", label: "Villa Ortuzar", subtitle: "Barrio, CABA, Argentina", lat: -34.5812, lng: -58.4767 },
  { id: "caba-villa-pueyrredon", label: "Villa Pueyrredon", subtitle: "Barrio, CABA, Argentina", lat: -34.5813, lng: -58.5031 },
  { id: "caba-villa-real", label: "Villa Real", subtitle: "Barrio, CABA, Argentina", lat: -34.6194, lng: -58.5286 },
  { id: "caba-villa-santa-rita", label: "Villa Santa Rita", subtitle: "Barrio, CABA, Argentina", lat: -34.6155, lng: -58.4828 },
  { id: "caba-villa-soldati", label: "Villa Soldati", subtitle: "Barrio, CABA, Argentina", lat: -34.6695, lng: -58.4442 },
  { id: "caba-villa-urquiza", label: "Villa Urquiza", subtitle: "Barrio, CABA, Argentina", lat: -34.5734, lng: -58.4866 },
  { id: "caba-versalles", label: "Versalles", subtitle: "Barrio, CABA, Argentina", lat: -34.6305, lng: -58.5212 },
];

interface GeoRefCentroide {
  lat?: number;
  lon?: number;
}

interface GeoRefEntidad {
  id?: string | number;
  nombre?: string;
  centroide?: GeoRefCentroide;
  provincia?: {
    nombre?: string;
  };
  municipio?: {
    nombre?: string;
  };
  departamento?: {
    nombre?: string;
  };
}

interface GeoRefResponse {
  localidades_censales?: GeoRefEntidad[];
  localidades?: GeoRefEntidad[];
  municipios?: GeoRefEntidad[];
}

const BASE_URL = "https://apis.datos.gob.ar/georef/api";

const buildSubtitle = (entity: GeoRefEntidad) => {
  return [
    entity.municipio?.nombre,
    entity.departamento?.nombre,
    entity.provincia?.nombre,
    "Argentina",
  ]
    .filter(Boolean)
    .join(", ");
};

const scoreSuggestion = (item: GeoRefPlaceSuggestion, search: string) => {
  const q = search.trim().toLowerCase();
  const label = item.label.toLowerCase();
  const subtitle = item.subtitle.toLowerCase();

  if (label === q) {
    return 0;
  }

  if (label.startsWith(q)) {
    return 1;
  }

  if (subtitle.startsWith(q)) {
    return 2;
  }

  if (label.includes(q)) {
    return 3;
  }

  if (subtitle.includes(q)) {
    return 4;
  }

  return 5;
};

const normalizePlaceKey = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeResults = (
  entities: GeoRefEntidad[],
  prefix: string
): GeoRefPlaceSuggestion[] =>
  entities
    .filter(
      (entity) =>
        Number.isFinite(entity.centroide?.lat) &&
        Number.isFinite(entity.centroide?.lon)
    )
    .map((entity, index) => ({
      id: `${prefix}-${String(entity.id || index)}`,
      label: entity.nombre || "Ubicacion",
      subtitle: buildSubtitle(entity),
      lat: Number(entity.centroide?.lat),
      lng: Number(entity.centroide?.lon),
    }));

export const searchBuenosAiresPlaces = async (
  searchText: string
): Promise<GeoRefPlaceSuggestion[]> => {
  if (searchText.trim().length < 2) {
    return [];
  }

  const query = encodeURIComponent(searchText.trim());

  const [localidadesRes, municipiosRes] = await Promise.all([
    fetch(
      `${BASE_URL}/localidades?nombre=${query}&campos=id,nombre,centroide,municipio,departamento,provincia&max=8&provincia=06`
    ),
    fetch(
      `${BASE_URL}/municipios?nombre=${query}&campos=id,nombre,centroide,provincia&max=6&provincia=06`
    ),
  ]);

  if (!localidadesRes.ok && !municipiosRes.ok) {
    throw new Error("No se pudieron cargar ubicaciones desde GeoRef");
  }

  const localidadesData = localidadesRes.ok
    ? ((await localidadesRes.json()) as GeoRefResponse)
    : { localidades: [] };
  const municipiosData = municipiosRes.ok
    ? ((await municipiosRes.json()) as GeoRefResponse)
    : { municipios: [] };

  const localidades = normalizeResults(localidadesData.localidades || [], "loc");
  const municipios = normalizeResults(municipiosData.municipios || [], "mun");
  const cabaBarrios = CABA_NEIGHBORHOODS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchText.trim().toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchText.trim().toLowerCase())
  );

  const unique = new Map<string, GeoRefPlaceSuggestion>();

  [...cabaBarrios, ...localidades, ...municipios].forEach((item) => {
    const key = normalizePlaceKey(item.label);
    const existing = unique.get(key);

    if (!existing) {
      unique.set(key, item);
      return;
    }

    const existingScore = scoreSuggestion(existing, searchText);
    const nextScore = scoreSuggestion(item, searchText);

    if (nextScore < existingScore) {
      unique.set(key, item);
      return;
    }

    if (nextScore === existingScore && item.subtitle.length < existing.subtitle.length) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values())
    .sort((a, b) => {
      const scoreA = scoreSuggestion(a, searchText);
      const scoreB = scoreSuggestion(b, searchText);

      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }

      return a.label.localeCompare(b.label, "es");
    })
    .slice(0, 8);
};
