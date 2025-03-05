
import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MessageList } from "@/components/mensagens/MessageList";
import { ConversationPanel } from "@/components/mensagens/ConversationPanel";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Conversation } from "@/types/messaging";

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
      
      // First fetch all conversations the user is part of
      const { data: conversationsData, error: conversationsError } = await supabase
        .from("conversations")
        .select("*")
        .or(`sender_id.eq.${session?.user?.id},receiver_id.eq.${session?.user?.id}`)
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;
      
      // For each conversation, get the profile of the other user
      const conversationsWithProfiles: Conversation[] = [];
      
      for (const conversation of conversationsData || []) {
        // Determine which user is the receiver (the other person in the conversation)
        const otherUserId = conversation.sender_id === session?.user?.id 
          ? conversation.receiver_id 
          : conversation.sender_id;
        
        // Fetch the profile for that user
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, role")
          .eq("id", otherUserId)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
        }
        
        // Add to our conversations array with the profile information
        conversationsWithProfiles.push({
          id: conversation.id,
          sender_id: conversation.sender_id,
          receiver_id: conversation.receiver_id,
          last_message: conversation.last_message,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          receiver_profile: profileData || null
        });
      }
      
      setConversations(conversationsWithProfiles);
      
      // Select the first conversation by default if there are any
      if (conversationsWithProfiles.length > 0 && !selectedConversation) {
        setSelectedConversation(conversationsWithProfiles[0].id);
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
