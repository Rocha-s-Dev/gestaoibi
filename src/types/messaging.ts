
import { Tables } from "@/integrations/supabase/types";

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string | null;
  attachment?: {
    path: string;
    type: string;
    name: string;
    size: number;
  } | null;
};

export type Conversation = {
  id: string;
  sender_id: string;
  receiver_id: string;
  last_message?: string | null;
  created_at: string;
  updated_at: string;
  receiver_profile?: {
    first_name: string | null;
    last_name: string | null;
    role: string;
  } | null;
};
