
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessageList } from "@/components/mensagens/MessageList";
import { ConversationPanel } from "@/components/mensagens/ConversationPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Conversation = Tables<"conversations"> & {
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
};

const Mensagens = () => {
  const { session } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          profiles:receiver_id(first_name, last_name)
        `)
        .or(`sender_id.eq.${session?.user?.id},receiver_id.eq.${session?.user?.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
      
      // Select the first conversation by default if there are any
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const handleCreateNewConversation = async (receiverId: string) => {
    if (!session?.user) return;
    
    try {
      // Check if a conversation already exists between these users
      const { data: existingConv, error: checkError } = await supabase
        .from("conversations")
        .select("id")
        .or(
          `and(sender_id.eq.${session.user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${session.user.id})`
        )
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      // If conversation exists, select it
      if (existingConv) {
        setSelectedConversation(existingConv.id);
        return;
      }

      // Create a new conversation
      const { data: newConv, error } = await supabase
        .from("conversations")
        .insert({
          sender_id: session.user.id,
          receiver_id: receiverId,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Refetch conversations to include the new one
      await fetchConversations();
      
      // Select the new conversation
      if (newConv) {
        setSelectedConversation(newConv.id);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <MessageList 
              conversations={conversations} 
              selectedConversationId={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onCreateNewConversation={handleCreateNewConversation}
            />
            {selectedConversation ? (
              <ConversationPanel 
                conversationId={selectedConversation} 
                onConversationUpdated={fetchConversations}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Selecione uma conversa ou inicie uma nova
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Mensagens;
