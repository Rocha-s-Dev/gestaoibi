
import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, X, FileText, Image, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Message, Conversation } from "@/types/messaging";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ConversationPanelProps {
  conversationId: string;
  onConversationUpdated?: () => void;
}

export const ConversationPanel = ({ 
  conversationId,
  onConversationUpdated
}: ConversationPanelProps) => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Fetch the conversation
      const { data: convData, error: convError } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single();

      if (convError) throw convError;
      
      // Determine which user is the other person in the conversation
      const otherUserId = convData.sender_id === session?.user?.id 
        ? convData.receiver_id 
        : convData.sender_id;
      
      // Fetch that user's profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("first_name, last_name, role")
        .eq("id", otherUserId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile:", profileError);
      }
      
      // Combine the conversation data with the profile
      const fullConversation: Conversation = {
        id: convData.id,
        sender_id: convData.sender_id,
        receiver_id: convData.receiver_id,
        last_message: convData.last_message,
        created_at: convData.created_at,
        updated_at: convData.updated_at,
        receiver_profile: profileData || null
      };
      
      setConversation(fullConversation);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    // Create a preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFile = async (): Promise<{ path: string; fileType: string; fileName: string } | null> => {
    if (!selectedFile || !session?.user?.id) return null;
    
    try {
      setUploading(true);
      
      // Create a folder structure with user ID to enforce RLS
      const folderPath = `${session.user.id}/${conversationId}`;
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `${folderPath}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('chat_attachments')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) throw error;
      
      return {
        path: data.path,
        fileType: selectedFile.type,
        fileName: selectedFile.name
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload do arquivo. Tente novamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !session?.user) return;
    
    try {
      let attachmentData = null;
      
      // If there's a file selected, upload it first
      if (selectedFile) {
        const fileData = await uploadFile();
        if (fileData) {
          attachmentData = {
            path: fileData.path,
            type: fileData.fileType,
            name: fileData.fileName,
            size: selectedFile.size
          };
        }
      }
      
      const newMessage = {
        conversation_id: conversationId,
        sender_id: session.user.id,
        content: messageText.trim() || (attachmentData ? "Enviou um arquivo" : ""),
        attachment: attachmentData
      };
      
      // Insert the message
      const { error: messageError } = await supabase
        .from("messages")
        .insert(newMessage);

      if (messageError) throw messageError;
      
      // Update conversation with last message text
      const { error: convError } = await supabase
        .from("conversations")
        .update({ 
          last_message: messageText.trim() || (attachmentData ? "Enviou um arquivo" : ""),
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);

      if (convError) throw convError;
      
      // Clear input field and selected file
      setMessageText("");
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Notify parent component that conversation was updated
      if (onConversationUpdated) {
        onConversationUpdated();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('chat_attachments')
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (fileType.startsWith('application/pdf') || 
               fileType.includes('document') || 
               fileType.includes('text/')) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const renderAttachment = (attachment: any) => {
    if (!attachment) return null;
    
    const fileUrl = getFileUrl(attachment.path);
    
    if (attachment.type.startsWith('image/')) {
      return (
        <a 
          href={fileUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="block mt-2 max-w-sm"
        >
          <img 
            src={fileUrl} 
            alt="Anexo" 
            className="max-w-full rounded-md border border-gray-200"
            style={{ maxHeight: '200px' }}
          />
        </a>
      );
    }
    
    return (
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="flex items-center gap-2 mt-2 text-sm text-blue-600 hover:underline"
      >
        {getFileIcon(attachment.type)}
        <span className="truncate max-w-[200px]">{attachment.name}</span>
      </a>
    );
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
              {conversation.receiver_profile?.first_name?.charAt(0) || "U"}
            </div>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {conversation.receiver_profile?.first_name} {conversation.receiver_profile?.last_name}
            </h3>
            <p className="text-sm text-gray-500">
              {conversation.receiver_profile?.role === "secretary" ? "Secretário" : 
               conversation.receiver_profile?.role === "admin" ? "Administrador" : "Funcionário"}
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
                    {message.content && (
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                    
                    {message.attachment && renderAttachment(message.attachment)}
                    
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
      
      {selectedFile && (
        <div className="px-4 pt-2 bg-white border-t">
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md">
            {filePreview ? (
              <div className="relative">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="h-16 w-16 object-cover rounded-md" 
                />
                <button 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center bg-white p-2 rounded-md">
                  {getFileIcon(selectedFile.type)}
                  <span className="ml-2 text-sm truncate max-w-[150px]">{selectedFile.name}</span>
                </div>
                <button 
                  className="text-red-500 hover:text-red-700"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-white">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            title="Anexar arquivo"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            placeholder="Digite sua mensagem..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
          />
          
          <Button 
            type="submit" 
            disabled={(uploading || (!messageText.trim() && !selectedFile))}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
