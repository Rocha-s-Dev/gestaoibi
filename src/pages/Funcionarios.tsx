import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AddUserDialog } from "@/components/funcionarios/AddUserDialog";

const Funcionarios = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("first_name");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProfiles = profiles?.filter(profile => 
    profile.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
            <AddUserDialog />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar funcionários..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <div className="grid gap-4">
              {filteredProfiles?.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {profile.first_name} {profile.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {profile.department || "Departamento não definido"}
                      </p>
                      <p className="text-sm text-gray-600 capitalize">
                        {profile.role === "admin" ? "Administrador" :
                         profile.role === "secretary" ? "Secretário" :
                         "Funcionário"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Funcionarios;