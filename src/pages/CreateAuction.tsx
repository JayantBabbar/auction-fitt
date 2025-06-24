import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSecureCreateAuction } from '@/hooks/useSecureAuctions';
import { ImageUpload } from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateTimePicker } from '@/components/DateTimePicker';
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

// Helper function to determine auction status based on timing
const getAuctionStatus = (startTime: Date, endTime: Date): 'draft' | 'upcoming' | 'active' | 'ended' => {
  const now = new Date();
  
  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now < endTime) {
    return 'active';
  } else {
    return 'ended';
  }
};

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const createAuctionMutation = useSecureCreateAuction();
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
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
      condition: 'excellent',
    },
  });

  const onSubmit = async (data: CreateAuctionForm) => {
    if (!user?.id || !profile) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create an auction.",
        variant: "destructive",
      });
      return;
    }

    // Verify user has admin role
    if (profile.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can create auctions.",
        variant: "destructive",
      });
      return;
    }

    // Client-side validation for end time
    if (data.end_time <= data.start_time) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time.",
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

    // Calculate duration in days for the database
    const durationMs = data.end_time.getTime() - data.start_time.getTime();
    const durationDays = Math.ceil(durationMs / (24 * 60 * 60 * 1000));

    // Determine auction status based on timing
    const auctionStatus = getAuctionStatus(data.start_time, data.end_time);

    // Use uploaded images if available, otherwise use placeholder images
    const finalImageUrls = imageUrls.length > 0 ? imageUrls : getPlaceholderImages(data.category);

    try {
      // Ensure dates are properly formatted as ISO strings
      const startTimeISO = data.start_time instanceof Date ? data.start_time.toISOString() : new Date(data.start_time).toISOString();
      const endTimeISO = data.end_time instanceof Date ? data.end_time.toISOString() : new Date(data.end_time).toISOString();

      const auctionData = {
        created_by: user.id, // Use Supabase user ID directly
        title: data.title,
        description: data.description,
        category: data.category,
        starting_bid: data.starting_bid,
        reserve_price: data.reserve_price || null,
        bid_increment: data.bid_increment,
        condition: data.condition,
        start_time: startTimeISO,
        end_time: endTimeISO,
        auction_duration: durationDays,
        status: auctionStatus,
        image_urls: finalImageUrls,
      };

      console.log('Submitting auction data with properly formatted dates:', auctionData);

      await createAuctionMutation.mutateAsync(auctionData);

      const statusMessage = auctionStatus === 'active' ? 'and is now live' : 
                           auctionStatus === 'upcoming' ? 'and will start at the scheduled time' : 
                           'but has already ended due to the timing';

      toast({
        title: "Auction Created",
        description: `"${data.title}" has been successfully created ${statusMessage}.`,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error creating auction:', error);
      // Error handling is now done in the mutation's onError callback
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
                          <FormControl>
                            <DateTimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Pick start date & time"
                              disabled={(date) => date < new Date()}
                              className="h-11 border-border/60 hover:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_time"
                      rules={{ 
                        required: "End time is required",
                        validate: (value) => {
                          const startTime = form.getValues('start_time');
                          if (value <= startTime) {
                            return "End time must be after start time";
                          }
                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-semibold">Auction End Date & Time</FormLabel>
                          <FormControl>
                            <DateTimePicker
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Pick end date & time"
                              disabled={(date) => date < new Date()}
                              className="h-11 border-border/60 hover:border-primary transition-colors"
                            />
                          </FormControl>
                          <FormDescription className="text-sm">
                            When the auction will end and close for bidding
                          </FormDescription>
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
