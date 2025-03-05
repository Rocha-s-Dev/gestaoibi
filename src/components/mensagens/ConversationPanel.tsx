
import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tables } from "@/integrations/supabase/types";

type Message = Tables<"messages">;
type Conversation = Tables<"conversations"> & {
  profiles: {
    first_name: string | null;
    last_name: string | null;
    role: string;
  } | null;
};

interface ConversationPanelProps {
  conversationId: string;
  onConversationUpdated?: () => void;
}

export const ConversationPanel = ({ 
  conversationId,
  onConversationUpdated
}: ConversationPanelProps) => {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
      
      // Subscribe to realtime updates for new messages
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            const newMessage = payload.new as Message;
            setMessages((prev) => [...prev, newMessage]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          profiles:receiver_id(first_name, last_name, role)
        `)
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error) {
      console.error("Error fetching conversation:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !session?.user) return;
    
    try {
      const newMessage = {
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: messageText.trim(),
      };
      
      // Insert the message
      const { error: messageError } = await supabase
        .from("messages")
        .insert(newMessage);

      if (messageError) throw messageError;
      
      // Update conversation with last message
      const { error: convError } = await supabase
        .from("conversations")
        .update({ 
          last_message: messageText.trim(),
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);

      if (convError) throw convError;
      
      // Clear input field
      setMessageText("");
      
      // Notify parent component that conversation was updated
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true,
      locale: ptBR
    });
  };

  const isCurrentUser = (senderId: string) => {
    return session?.user?.id === senderId;
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Carregando conversa...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <div className="bg-primary text-primary-foreground h-full w-full flex items-center justify-center text-lg">
              {conversation.profiles?.first_name?.charAt(0) || "U"}
            </div>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {conversation.profiles?.first_name} {conversation.profiles?.last_name}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation.profiles?.role === "secretary" ? "Secretário" : 
               conversation.profiles?.role === "admin" ? "Administrador" : "Funcionário"}
            </p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center p-4">
            <p>Carregando mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center p-4 text-gray-500">
            <p>Nenhuma mensagem ainda. Envie a primeira!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isSender = isCurrentUser(message.sender_id);
              
              return (
                <div 
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isSender 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                    <p 
                      className={`text-xs mt-1 ${
                        isSender ? 'text-primary-foreground/80' : 'text-gray-500'
                      }`}
                    >
                      {formatMessageTime(message.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <div className="p-4 border-t bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <Input
            placeholder="Digite sua mensagem..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
