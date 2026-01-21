-- Create profiles table for user metadata
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  percentage_increase NUMERIC DEFAULT 0,
  enable_alerts BOOLEAN DEFAULT false,
  alert_threshold INTEGER DEFAULT 90,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configuracoes_alertas table for educational alert settings
CREATE TABLE IF NOT EXISTS public.configuracoes_alertas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  percentual_faltas_warning INTEGER NOT NULL DEFAULT 15,
  percentual_faltas_critical INTEGER NOT NULL DEFAULT 25,
  nota_minima NUMERIC NOT NULL DEFAULT 6.0,
  dias_sem_frequencia_evasao INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_alertas ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Financial goals policies
CREATE POLICY "Authenticated can view financial_goals" ON public.financial_goals FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert financial_goals" ON public.financial_goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update financial_goals" ON public.financial_goals FOR UPDATE USING (true);
CREATE POLICY "Authenticated can delete financial_goals" ON public.financial_goals FOR DELETE USING (true);

-- Configuracoes alertas policies (single global config)
CREATE POLICY "Authenticated can view configuracoes" ON public.configuracoes_alertas FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert configuracoes" ON public.configuracoes_alertas FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated can update configuracoes" ON public.configuracoes_alertas FOR UPDATE USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_alertas_updated_at
  BEFORE UPDATE ON public.configuracoes_alertas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();