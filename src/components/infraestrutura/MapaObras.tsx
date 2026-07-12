import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useObras, SITUACOES_OBRA } from "@/hooks/useObras";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

function markerIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8],
  });
}

const COLOR_BY_SITUACAO: Record<string, string> = {
  planejamento: "#3b82f6", licitacao: "#8b5cf6", andamento: "#22c55e",
  parada: "#eab308", atrasada: "#f97316", concluida: "#6b7280", cancelada: "#ef4444",
};

export function MapaObras() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const group = useRef<L.LayerGroup | null>(null);
  const { obras } = useObras();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;
    const map = L.map(mapRef.current).setView([-12.65, -40.93], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap" }).addTo(map);
    group.current = L.layerGroup().addTo(map);
    mapInstance.current = map;
    return () => { map.remove(); mapInstance.current = null; };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !group.current) return;
    group.current.clearLayers();
    obras.forEach(o => {
      if (o.latitude && o.longitude) {
        const c = COLOR_BY_SITUACAO[o.situacao] ?? "#3b82f6";
        L.marker([Number(o.latitude), Number(o.longitude)], { icon: markerIcon(c) })
          .bindPopup(`<b>${o.nome}</b><br/>${o.bairro ?? ""}<br/>Situação: ${o.situacao}`)
          .addTo(group.current!);
      }
    });
  }, [obras]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Obras</CardTitle>
        <div className="flex flex-wrap gap-3 mt-2">
          {SITUACOES_OBRA.map(s => (
            <div key={s.value} className="flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded-full" style={{ background: COLOR_BY_SITUACAO[s.value] }} />
              {s.label}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent><div ref={mapRef} className="w-full h-[500px] rounded-md border" /></CardContent>
    </Card>
  );
}
