import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDenunciasAmbientais } from "@/hooks/useAmbiental";
import { useFiscalizacoesAmbientais, useAreasProtegidas, useEmpreendimentosAmbientais, useOcorrenciasQueimadas } from "@/hooks/useAmbientalExpanded";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const LAYERS = [
  { key: "denuncias", label: "Denúncias", color: "#ef4444" },
  { key: "fiscalizacoes", label: "Fiscalizações", color: "#3b82f6" },
  { key: "areas", label: "Áreas Protegidas", color: "#22c55e" },
  { key: "empreendimentos", label: "Empreendimentos", color: "#f59e0b" },
  { key: "queimadas", label: "Queimadas", color: "#f97316" },
];

function createIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export function MapaAmbiental() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const layerGroups = useRef<Record<string, L.LayerGroup>>({});

  const { denuncias } = useDenunciasAmbientais();
  const { data: fiscalizacoes } = useFiscalizacoesAmbientais();
  const { data: areas } = useAreasProtegidas();
  const { data: empreendimentos } = useEmpreendimentosAmbientais();
  const { data: queimadas } = useOcorrenciasQueimadas();

  const [visible, setVisible] = useState<Record<string, boolean>>({
    denuncias: true, fiscalizacoes: true, areas: true, empreendimentos: true, queimadas: true,
  });

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    // Ibiquera, BA coordinates
    const map = L.map(mapRef.current).setView([-12.65, -40.93], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    mapInstance.current = map;

    LAYERS.forEach(l => {
      layerGroups.current[l.key] = L.layerGroup().addTo(map);
    });

    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    const addMarkers = (key: string, items: any[], nameField: string, color: string) => {
      const group = layerGroups.current[key];
      if (!group) return;
      group.clearLayers();
      if (!visible[key]) return;
      (items || []).forEach((item: any) => {
        if (item.latitude && item.longitude) {
          L.marker([item.latitude, item.longitude], { icon: createIcon(color) })
            .bindPopup(`<b>${item[nameField] || "Sem nome"}</b>`)
            .addTo(group);
        }
      });
    };

    addMarkers("denuncias", denuncias, "tipo_denuncia", "#ef4444");
    addMarkers("fiscalizacoes", fiscalizacoes, "local", "#3b82f6");
    addMarkers("areas", areas, "nome", "#22c55e");
    addMarkers("empreendimentos", empreendimentos, "nome", "#f59e0b");
    addMarkers("queimadas", queimadas, "local", "#f97316");
  }, [denuncias, fiscalizacoes, areas, empreendimentos, queimadas, visible]);

  const toggleLayer = (key: string) => {
    setVisible(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa Ambiental do Município</CardTitle>
        <div className="flex flex-wrap gap-4 mt-2">
          {LAYERS.map(l => (
            <div key={l.key} className="flex items-center gap-1.5">
              <Switch checked={visible[l.key]} onCheckedChange={() => toggleLayer(l.key)} />
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                <Label className="text-xs">{l.label}</Label>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="w-full h-[500px] rounded-md border" />
      </CardContent>
    </Card>
  );
}
