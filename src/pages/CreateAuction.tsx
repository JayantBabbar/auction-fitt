
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateAuction } from '@/hooks/useAuctions';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon,
  Clock,
  DollarSign,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateAuctionForm {
  title: string;
  description: string;
  category: string;
  starting_bid: number;
  reserve_price: number;
  bid_increment: number;
  start_time: Date;
  end_time: Date;
  condition: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
}

const getPlaceholderImages = (category: string): string[] => {
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('laptop') || categoryLower.includes('computer')) {
    return [
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
      'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'
    ];
  }
  
  if (categoryLower.includes('tech') || categoryLower.includes('electronic')) {
    return [
      'https://images.unsplash.com/photo-1518770660439-4636190af475',
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6'
    ];
  }
  
  // Default placeholder images
  return [
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7'
  ];
};

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createAuctionMutation = useCreateAuction();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const form = useForm<CreateAuctionForm>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      starting_bid: 0,
      reserve_price: 0,
      bid_increment: 50,
      start_time: new Date(),
      end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      condition: 'excellent',
    },
  });

  const onSubmit = async (data: CreateAuctionForm) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an auction.",
        variant: "destructive",
      });
      return;
    }

    // Client-side validation for reserve price
    if (data.reserve_price > 0 && data.reserve_price < data.starting_bid) {
      toast({
        title: "Validation Error",
        description: "Reserve price must be greater than or equal to the starting bid.",
        variant: "destructive",
      });
      return;
    }

    console.log('User creating auction:', user);
    console.log('Form data:', data);

    // Calculate duration in days
    const durationMs = data.end_time.getTime() - data.start_time.getTime();
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

    if (durationDays <= 0) {
      toast({
        title: "Invalid Duration",
        description: "End time must be after start time.",
        variant: "destructive",
      });
      return;
    }

    // Use placeholder images if no images uploaded
    const finalImageUrls = imageUrls.length > 0 ? imageUrls : getPlaceholderImages(data.category);

    try {
      const auctionData = {
        created_by: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        starting_bid: data.starting_bid,
        reserve_price: data.reserve_price || null,
        bid_increment: data.bid_increment,
        condition: data.condition,
        start_time: data.start_time.toISOString(),
        auction_duration: durationDays,
        status: 'draft' as const,
        image_urls: finalImageUrls,
      };

      console.log('Submitting auction data:', auctionData);

      await createAuctionMutation.mutateAsync(auctionData);

      toast({
        title: "Auction Created",
        description: `"${data.title}" has been successfully created as a draft.`,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error creating auction:', error);
      
      // Handle specific database errors
      let errorMessage = "Failed to create auction. Please try again.";
      
      if (error?.message?.includes('auctions_check')) {
        errorMessage = "Reserve price must be greater than or equal to starting bid.";
      } else if (error?.message?.includes('starting_bid')) {
        errorMessage = "Starting bid must be a positive number.";
      } else if (error?.message?.includes('title')) {
        errorMessage = "Asset name is required.";
      } else if (error?.message?.includes('description')) {
        errorMessage = "Description is required.";
      } else if (error?.code === '23505') {
        errorMessage = "An auction with this title already exists.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:bg-muted/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">Create New Auction</h1>
              <p className="text-sm text-muted-foreground">Add a new asset to the auction platform</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Asset Information */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl font-serif flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    Asset Information
                  </CardTitle>
                  <CardDescription className="text-base">
                    Provide essential details about the asset being auctioned
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      rules={{ required: "Asset name is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Asset Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter asset name" 
                              className="h-11 border-border/60 focus:border-primary transition-colors"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Category</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Art, Jewelry, Collectibles" 
                              className="h-11 border-border/60 focus:border-primary transition-colors"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    rules={{ required: "Description is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the asset..."
                            className="min-h-[140px] border-border/60 focus:border-primary resize-none transition-colors"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-sm">
                          Include condition, history, and any notable features
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold">Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 border-border/60 focus:border-primary">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="very_good">Very Good</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Auction Parameters */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl font-serif flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    Auction Parameters
                  </CardTitle>
                  <CardDescription className="text-base">
                    Set pricing and timing for the auction
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="starting_bid"
                      rules={{ 
                        required: "Starting bid is required",
                        min: { value: 0.01, message: "Starting bid must be greater than 0" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Starting Bid ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              step="0.01"
                              min="0.01"
                              className="h-11 border-border/60 focus:border-primary transition-colors"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="reserve_price"
                      rules={{
                        validate: (value) => {
                          const startingBid = form.getValues('starting_bid');
                          if (value > 0 && value < startingBid) {
                            return "Reserve price must be greater than or equal to starting bid";
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Reserve Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              step="0.01"
                              min="0"
                              className="h-11 border-border/60 focus:border-primary transition-colors"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-sm">
                            Minimum acceptable price (optional). Must be ≥ starting bid if set.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bid_increment"
                      rules={{ 
                        required: "Bid increment is required",
                        min: { value: 0.01, message: "Bid increment must be greater than 0" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Bid Increment ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50"
                              step="0.01"
                              min="0.01"
                              className="h-11 border-border/60 focus:border-primary transition-colors"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-sm">
                            Minimum amount by which bids must increase
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="start_time"
                      rules={{ required: "Start time is required" }}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-semibold">Auction Start Date & Time</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-11 pl-3 text-left font-normal border-border/60 hover:border-primary transition-colors",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP 'at' p")
                                  ) : (
                                    <span>Pick start date & time</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_time"
                      rules={{ required: "End time is required" }}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-semibold">Auction End Date & Time</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "h-11 pl-3 text-left font-normal border-border/60 hover:border-primary transition-colors",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP 'at' p")
                                  ) : (
                                    <span>Pick end date & time</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < form.watch('start_time') || date < new Date()}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card className="border-border/50 shadow-lg">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl font-serif flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    Asset Images
                  </CardTitle>
                  <CardDescription className="text-base">
                    Upload high-quality images of the asset (optional - placeholder images will be used if none are uploaded)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    onImagesChange={setImageUrls}
                    maxImages={5}
                    existingImages={imageUrls}
                  />
                </CardContent>
              </Card>

              {/* Submit Actions */}
              <div className="flex justify-end gap-4 pt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="px-8 h-11"
                  disabled={createAuctionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-8 h-11 bg-primary hover:bg-primary/90 shadow-lg"
                  disabled={createAuctionMutation.isPending}
                >
                  {createAuctionMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Auction'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuction;
