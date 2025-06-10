
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateAuction } from '@/hooks/useAuctions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Upload, 
  Plus,
  X,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react';

interface CreateAuctionForm {
  title: string;
  description: string;
  category: string;
  starting_bid: number;
  reserve_price: number;
  auction_duration: number;
  condition: 'excellent' | 'very_good' | 'good' | 'fair' | 'poor';
  provenance: string;
  dimensions: string;
  weight: string;
}

const CreateAuction = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const createAuctionMutation = useCreateAuction();
  
  const form = useForm<CreateAuctionForm>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      starting_bid: 0,
      reserve_price: 0,
      auction_duration: 7,
      condition: 'excellent',
      provenance: '',
      dimensions: '',
      weight: '',
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

    try {
      await createAuctionMutation.mutateAsync({
        created_by: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        starting_bid: data.starting_bid,
        reserve_price: data.reserve_price || null,
        condition: data.condition,
        provenance: data.provenance || null,
        dimensions: data.dimensions || null,
        weight: data.weight || null,
        auction_duration: data.auction_duration,
        status: 'draft',
      });

      toast({
        title: "Auction Created",
        description: `"${data.title}" has been successfully created as a draft.`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error creating auction:', error);
      toast({
        title: "Error",
        description: "Failed to create auction. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files);
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-serif font-semibold text-foreground">Create New Auction</h1>
              <p className="text-sm text-muted-foreground">Add a new asset to the auction platform</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Asset Information
                  </CardTitle>
                  <CardDescription>
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
                          <FormLabel className="text-sm font-medium">Asset Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter asset name" 
                              className="border-border/50 focus:border-primary"
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
                          <FormLabel className="text-sm font-medium">Category</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Art, Jewelry, Collectibles" 
                              className="border-border/50 focus:border-primary"
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
                        <FormLabel className="text-sm font-medium">Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Provide a detailed description of the asset..."
                            className="min-h-[120px] border-border/50 focus:border-primary resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
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
                        <FormLabel className="text-sm font-medium">Condition</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-border/50 focus:border-primary">
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

              {/* Financial Details */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Auction Parameters
                  </CardTitle>
                  <CardDescription>
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
                        min: { value: 0, message: "Starting bid must be positive" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Starting Bid ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              className="border-border/50 focus:border-primary"
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Reserve Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0"
                              className="border-border/50 focus:border-primary"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Minimum acceptable price</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="auction_duration"
                      rules={{ 
                        required: "Duration is required",
                        min: { value: 1, message: "Duration must be at least 1 day" }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Duration (days)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="7"
                              className="border-border/50 focus:border-primary"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 7)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Asset Details */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif">Additional Details</CardTitle>
                  <CardDescription>
                    Provide technical specifications and provenance information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="provenance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Provenance</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Origin and ownership history" 
                              className="border-border/50 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="dimensions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Dimensions</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="L x W x H (inches/cm)" 
                              className="border-border/50 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Weight</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Weight with unit" 
                              className="border-border/50 focus:border-primary"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Image Upload */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-serif">Asset Images</CardTitle>
                  <CardDescription>
                    Upload high-quality images of the asset (coming soon)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center opacity-50">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Image upload coming soon</p>
                      <p className="text-xs text-muted-foreground">
                        File storage will be implemented in the next update
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="px-6"
                  disabled={createAuctionMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-6 bg-primary hover:bg-primary/90"
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
