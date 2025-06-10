
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DollarSign
} from 'lucide-react';

interface CreateAuctionForm {
  assetName: string;
  assetDescription: string;
  category: string;
  startingBid: number;
  reservePrice: number;
  auctionDuration: number;
  condition: string;
  provenance: string;
  dimensions: string;
  weight: string;
  images: FileList | null;
}

const CreateAuction = () => {
  const navigate = useNavigate();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  
  const form = useForm<CreateAuctionForm>({
    defaultValues: {
      assetName: '',
      assetDescription: '',
      category: '',
      startingBid: 0,
      reservePrice: 0,
      auctionDuration: 7,
      condition: '',
      provenance: '',
      dimensions: '',
      weight: '',
      images: null,
    },
  });

  const onSubmit = (data: CreateAuctionForm) => {
    console.log('Creating auction:', data);
    console.log('Uploaded images:', uploadedImages);
    // TODO: Submit to backend
    navigate('/');
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
                      name="assetName"
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
                    name="assetDescription"
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
                      name="startingBid"
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
                      name="reservePrice"
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
                      name="auctionDuration"
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
                      name="condition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Condition</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Excellent, Good, Fair" 
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
                    Upload high-quality images of the asset (recommended: multiple angles)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <div className="space-y-2">
                      <Label htmlFor="image-upload" className="text-sm font-medium cursor-pointer">
                        Click to upload images
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Support for JPG, PNG files up to 10MB each
                      </p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border/50"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Actions */}
              <div className="flex justify-end gap-4 pt-6 border-t border-border/50">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="px-6 bg-primary hover:bg-primary/90"
                >
                  Create Auction
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
