import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface StatsCardsProps {
  stats: {
    label: string;
    value: number;
    color: string;
    icon: any;
  }[];
}

export const StatsCards = memo(({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6 flex items-center gap-4">
            <div className={cn("p-4 rounded-2xl text-white shadow-inner", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

StatsCards.displayName = "StatsCards";
