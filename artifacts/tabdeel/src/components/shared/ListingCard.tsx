import { Link } from 'wouter';
import { Listing } from '@workspace/api-client-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRightLeft, Image as ImageIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ListingCardProps {
  listing: Listing;
}

const conditionMap: Record<string, { label: string; color: string }> = {
  new: { label: 'جديد', color: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' },
  good: { label: 'جيد', color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20' },
  used: { label: 'مستخدم', color: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' },
};

export function ListingCard({ listing }: ListingCardProps) {
  const condition = conditionMap[listing.condition] || conditionMap.used;

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="group h-full overflow-hidden transition-all hover:shadow-md cursor-pointer border-border/50 bg-card hover:border-primary/20">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <Badge className={condition.color} variant="secondary">
              {condition.label}
            </Badge>
            {listing.isFeatured && (
              <Badge className="bg-accent text-accent-foreground hover:bg-accent/90">
                مميز
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              {listing.category.name}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate max-w-[80px]">{listing.city}</span>
            </div>
          </div>
          <h3 className="font-semibold text-lg line-clamp-1 mb-2 group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="flex items-start gap-2 bg-secondary/50 rounded-md p-2 mt-3">
            <ArrowRightLeft className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="text-muted-foreground text-xs block">مطلوب للبدل:</span>
              <span className="font-medium line-clamp-1">{listing.wantsInExchange}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto bg-muted/20">
          <div className="flex items-center gap-2 pt-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={listing.owner.avatarUrl || ''} />
              <AvatarFallback className="text-[10px]">
                {listing.owner.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">{listing.owner.name}</span>
          </div>
          <span className="text-xs text-muted-foreground pt-3">
            {new Date(listing.createdAt).toLocaleDateString('ar-JO')}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
