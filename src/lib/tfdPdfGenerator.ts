import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";

interface VeiculoTFDPrint {
  veiculoPlaca: string;
  veiculoModelo: string;
  motoristaNome: string;
  pacientes: {
    numero_ordem: number | null;
    nome_paciente: string;
    telefone: string | null;
    endereco: string | null;
    procedimento: string | null;
    local_atendimento: string | null;
    horario_atendimento: string | null;
  }[];
}

interface ViagemPrintData {
  protocolo: string;
  dataViagem: string;
  horarioSaida: string | null;
  destinos: string;
  veiculos: VeiculoTFDPrint[];
}

export async function gerarPDFControleMarcacao(viagemId: string) {
  try {
    // Fetch viagem
    const { data: viagem, error: errViagem } = await supabase
      .from("viagens_tfd")
      .select("*")
      .eq("id", viagemId)
      .single();
    if (errViagem || !viagem) throw new Error("Viagem não encontrada");

    // Fetch destinos
    const { data: destinos = [] } = await supabase
      .from("destinos_tfd")
      .select("*")
      .eq("viagem_id", viagemId)
      .order("ordem");

    // Fetch veículos with vehicle and motorista info
    const { data: veiculosTfd = [] } = await supabase
      .from("veiculos_tfd")
      .select("*, veiculos_frota:veiculo_id(placa, modelo, marca), motoristas:motorista_id(id, user_id)")
      .eq("viagem_id", viagemId);

    // Fetch all pacientes for this viagem
    const { data: todosPacientes = [] } = await supabase
      .from("pacientes_tfd")
      .select("*, destinos_tfd:destino_id(cidade_destino, hospital_unidade)")
      .eq("viagem_id", viagemId)
      .order("numero_ordem");

    // Fetch pacientes_veiculo_tfd assignments
    const veiculoIds = veiculosTfd.map((v: any) => v.id);
    let assignmentsMap: Record<string, string[]> = {};

    if (veiculoIds.length > 0) {
      const { data: assignments = [] } = await supabase
        .from("pacientes_veiculo_tfd")
        .select("*")
        .in("veiculo_tfd_id", veiculoIds);

      for (const a of assignments || []) {
        if (!assignmentsMap[a.veiculo_tfd_id]) assignmentsMap[a.veiculo_tfd_id] = [];
        assignmentsMap[a.veiculo_tfd_id].push(a.paciente_tfd_id);
      }
    }

    // Fetch motorista names from profiles
    const motoristaUserIds = veiculosTfd
      .map((v: any) => v.motoristas?.user_id)
      .filter(Boolean);

    let motoristaNames: Record<string, string> = {};
    if (motoristaUserIds.length > 0) {
      const { data: profiles = [] } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", motoristaUserIds);
      for (const p of profiles || []) {
        motoristaNames[p.user_id] = p.name || "—";
      }
    }

    const destinoStr = (destinos || [])
      .map((d: any) => `${d.cidade_destino}/${d.uf_destino}`)
      .join(", ");

    const hasAssignments = Object.keys(assignmentsMap).length > 0;

    // Build vehicle print data
    const veiculosPrint: VeiculoTFDPrint[] = veiculosTfd.map((v: any) => {
      const motorUserid = v.motoristas?.user_id;
      const nome = motorUserid ? (motoristaNames[motorUserid] || "—") : "—";

      let pacientesDoVeiculo: any[];
      if (hasAssignments && assignmentsMap[v.id]) {
        const ids = assignmentsMap[v.id];
        pacientesDoVeiculo = todosPacientes.filter((p: any) => ids.includes(p.id));
      } else {
        // No assignments: all patients go to all vehicles (fallback)
        pacientesDoVeiculo = todosPacientes;
      }

      return {
        veiculoPlaca: v.veiculos_frota?.placa || "—",
        veiculoModelo: `${v.veiculos_frota?.marca || ""} ${v.veiculos_frota?.modelo || ""}`.trim() || "—",
        motoristaNome: nome,
        pacientes: pacientesDoVeiculo.map((p: any) => ({
          numero_ordem: p.numero_ordem,
          nome_paciente: p.nome_paciente,
          telefone: p.telefone,
          endereco: p.endereco,
          procedimento: p.procedimento,
          local_atendimento: p.local_atendimento || p.destinos_tfd?.hospital_unidade || p.destinos_tfd?.cidade_destino || "—",
          horario_atendimento: p.horario_atendimento,
        })),
      };
    });

    if (veiculosPrint.length === 0) {
      toast.error("Nenhum veículo designado para esta viagem");
      return;
    }

    const dataFormatada = format(new Date(viagem.data_viagem), "dd/MM/yyyy");

    // Generate one PDF page per vehicle/driver
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    veiculosPrint.forEach((veiculo, idx) => {
      if (idx > 0) doc.addPage();

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // === HEADER ===
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("SECRETARIA MUNICIPAL DE SAÚDE", pageWidth / 2, 14, { align: "center" });

      doc.setFontSize(16);
      doc.text("CONTROLE DE MARCAÇÃO", pageWidth / 2, 22, { align: "center" });

      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.line(14, 26, pageWidth - 14, 26);

      // === INFO ROW ===
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");

      // Left side
      doc.text(`Data: `, 14, 33);
      doc.setFont("helvetica", "normal");
      doc.text(dataFormatada, 14 + doc.getTextWidth("Data: "), 33);

      doc.setFont("helvetica", "bold");
      doc.text(`Destino: `, 14, 39);
      doc.setFont("helvetica", "normal");
      doc.text(destinoStr || "—", 14 + doc.getTextWidth("Destino: "), 39);

      doc.setFont("helvetica", "bold");
      doc.text(`Motorista: `, 14, 45);
      doc.setFont("helvetica", "normal");
      doc.text(veiculo.motoristaNome, 14 + doc.getTextWidth("Motorista: "), 45);

      // Right side
      const rightX = pageWidth / 2 + 20;
      doc.setFont("helvetica", "bold");
      doc.text(`Horário de Saída: `, rightX, 33);
      doc.setFont("helvetica", "normal");
      doc.text(viagem.horario_saida || "—", rightX + doc.getTextWidth("Horário de Saída: "), 33);

      doc.setFont("helvetica", "bold");
      doc.text(`Veículo: `, rightX, 39);
      doc.setFont("helvetica", "normal");
      doc.text(veiculo.veiculoModelo, rightX + doc.getTextWidth("Veículo: "), 39);

      doc.setFont("helvetica", "bold");
      doc.text(`Placa: `, rightX, 45);
      doc.setFont("helvetica", "normal");
      doc.text(veiculo.veiculoPlaca, rightX + doc.getTextWidth("Placa: "), 45);

      // === TABLE ===
      const headers = ["Nº Ordem", "Paciente", "Telefone", "Endereço", "Procedimento", "Local", "Horário"];
      const rows = veiculo.pacientes.map((p, i) => [
        p.numero_ordem?.toString() || (i + 1).toString(),
        p.nome_paciente || "—",
        p.telefone || "—",
        p.endereco || "—",
        p.procedimento || "—",
        p.local_atendimento || "—",
        p.horario_atendimento || "—",
      ]);

      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 50,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
          0: { cellWidth: 18, halign: "center" },
          1: { cellWidth: 45 },
          2: { cellWidth: 28 },
          3: { cellWidth: 50 },
          4: { cellWidth: 40 },
          5: { cellWidth: 45 },
          6: { cellWidth: 22, halign: "center" },
        },
        margin: { left: 14, right: 14 },
      });

      // === SIGNATURES ===
      const finalY = (doc as any).lastAutoTable?.finalY || 140;
      const sigY = Math.max(finalY + 20, pageHeight - 45);
      const lineLen = 80;

      // Left: Coordenador de Transportes
      doc.setLineWidth(0.3);
      doc.line(14, sigY, 14 + lineLen, sigY);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Coordenador de Transportes", 14 + lineLen / 2, sigY + 5, { align: "center" });

      // Right: Secretária de Saúde
      const rightSigX = pageWidth - 14 - lineLen;
      doc.line(rightSigX, sigY, rightSigX + lineLen, sigY);
      doc.text("Secretária de Saúde", rightSigX + lineLen / 2, sigY + 5, { align: "center" });

      // === FOOTER ===
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Secretaria Municipal de Saúde — Endereço, Telefone e CNPJ da Secretaria",
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      );
    });

    doc.save(`Controle_Marcacao_TFD_${viagem.protocolo}_${dataFormatada.replace(/\//g, "-")}.pdf`);
    toast.success("PDF gerado com sucesso!");
  } catch (err: any) {
    console.error("Erro ao gerar PDF TFD:", err);
    toast.error("Erro ao gerar PDF: " + err.message);
  }
}
