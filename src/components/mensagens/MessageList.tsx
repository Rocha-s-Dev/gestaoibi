
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { NewConversationDialog } from "./NewConversationDialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Conversation } from "@/types/messaging";

interface MessageListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateNewConversation: (receiverId: string) => void;
}

export const MessageList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onCreateNewConversation
}: MessageListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredConversations = conversations.filter(
    (conversation) => {
      const fullName = `${conversation.receiver_profile?.first_name || ''} ${conversation.receiver_profile?.last_name || ''}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    }
  );

  const formatMessageDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: ptBR
    });
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-white flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold mb-4">Mensagens</h2>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar conversa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Nova Mensagem
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                  selectedConversationId === conversation.id ? "bg-blue-50" : ""
                }`}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start">
                  <Avatar className="h-10 w-10 mr-3">
                    <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-lg">
                      {conversation.receiver_profile?.first_name?.charAt(0) || "U"}
                    </div>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <p className="font-medium truncate">
                        {conversation.receiver_profile?.first_name} {conversation.receiver_profile?.last_name}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatMessageDate(conversation.updated_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.last_message || "Nenhuma mensagem ainda"}
                    </p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? "Nenhuma conversa encontrada" : "Nenhuma conversa iniciada"}
            </div>
          )}
        </div>
      </ScrollArea>
      
      <NewConversationDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        onSelectUser={onCreateNewConversation}
      />
    </div>
  );
};
