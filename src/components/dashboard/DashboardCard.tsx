import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
}

export const DashboardCard = ({
  title,
  value,
  icon,
  description,
  className,
}: DashboardCardProps) => {
  return (
    <Card className={cn("p-6 transition-all duration-300 hover:shadow-lg animate-fadeIn", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="text-primary h-10 w-10">{icon}</div>
      </div>
    </Card>
  );
};