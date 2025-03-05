
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
}

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onSelectUser,
}: NewConversationDialogProps) => {
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, searchTerm]);

  const fetchUsers = async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const query = supabase
        .from("profiles")
        .select("*")
        .neq("id", session.user.id);
      
      if (searchTerm) {
        query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false);
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case "admin": return "Administrador";
      case "secretary": return "Secretário";
      case "mayor": return "Prefeito";
      default: return "Funcionário";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Mensagem</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4 mt-2">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <ScrollArea className="h-[300px] pr-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <p>Carregando usuários...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center p-4 text-gray-500">
              <p>Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => (
                <button
                  key={user.id}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-md transition-colors flex items-center"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-lg">
                      {user.first_name?.charAt(0) || "U"}
                    </div>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getRoleDisplay(user.role)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
