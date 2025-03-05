
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables } from "@/integrations/supabase/types";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectUser: (userId: string) => void;
}

type UserProfile = Tables<"profiles"> & {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
};

export function NewConversationDialog({
  open,
  onOpenChange,
  onSelectUser,
}: NewConversationDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { session } = useAuth();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", session?.user?.id || "")
        .order("first_name");
      
      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: open, // Only fetch when dialog is open
  });

  const filteredUsers = users?.filter((user) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const handleSelectUser = (userId: string) => {
    onSelectUser(userId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Conversa</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-4">Carregando usuários...</div>
            ) : filteredUsers?.length ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  className="w-full p-3 flex items-center hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => handleSelectUser(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-lg">
                      {user.first_name?.charAt(0) || "U"}
                    </div>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.role === "secretary" ? "Secretário" : 
                       user.role === "admin" ? "Administrador" : "Funcionário"}
                    </p>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                {searchTerm ? "Nenhum usuário encontrado" : "Nenhum usuário disponível"}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
