import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { STATUS_OS, useOrdensServico } from "@/hooks/useOrdensServico";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const COLOR_BY_STATUS: Record<string, string> = {
  aberta: "#3b82f6", designada: "#8b5cf6", em_execucao: "#f59e0b",
  suspensa: "#f97316", concluida: "#22c55e", cancelada: "#ef4444",
};

function markerIcon(color: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8],
  });
}

export function MapaServicos() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const group = useRef<L.LayerGroup | null>(null);
  const { ordens } = useOrdensServico();

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
    ordens.forEach(o => {
      if (o.latitude && o.longitude) {
        const c = COLOR_BY_STATUS[o.status] ?? "#3b82f6";
        L.marker([Number(o.latitude), Number(o.longitude)], { icon: markerIcon(c) })
          .bindPopup(`<b>${o.numero_os ?? "OS"}</b><br/>${o.tipo_nome ?? ""}<br/>${o.bairro ?? ""}<br/>Situação: ${o.status}`)
          .addTo(group.current!);
      }
    });
  }, [ordens]);

  const semCoordenadas = ordens.filter(o => !o.latitude || !o.longitude).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa de Serviços Urbanos</CardTitle>
        <div className="flex flex-wrap gap-3 mt-2">
          {STATUS_OS.map(s => (
            <div key={s.value} className="flex items-center gap-1 text-xs">
              <span className="w-3 h-3 rounded-full" style={{ background: COLOR_BY_STATUS[s.value] }} />
              {s.label}
            </div>
          ))}
        </div>
        {semCoordenadas > 0 && (
          <p className="text-xs text-muted-foreground mt-1">{semCoordenadas} ordem(ns) de serviço sem coordenadas informadas.</p>
        )}
      </CardHeader>
      <CardContent><div ref={mapRef} className="w-full h-[500px] rounded-md border" /></CardContent>
    </Card>
  );
}
