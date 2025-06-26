
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUpdateAuction, useDeleteAuction } from '@/hooks/useAuctions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Ban, Play, Pause } from 'lucide-react';

interface AuctionActionsProps {
  auction: any;
}

const AuctionActions = ({ auction }: AuctionActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const updateAuctionMutation = useUpdateAuction();
  const deleteAuctionMutation = useDeleteAuction();
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [targetStatus, setTargetStatus] = useState<string>('');

  const handleEdit = () => {
    navigate(`/create-auction?edit=${auction.id}`);
  };

  const handleStatusChange = (newStatus: string) => {
    setTargetStatus(newStatus);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = async () => {
    try {
      await updateAuctionMutation.mutateAsync({
        id: auction.id,
        updates: { status: targetStatus as any }
      });
      
      toast({
        title: "Auction Updated",
        description: `Auction status changed to ${targetStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update auction status",
        variant: "destructive"
      });
    }
    setShowStatusDialog(false);
  };

  const handleDelete = async () => {
    try {
      await deleteAuctionMutation.mutateAsync(auction.id);
      toast({
        title: "Auction Deleted",
        description: "The auction has been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete auction",
        variant: "destructive"
      });
    }
    setShowDeleteDialog(false);
  };

  const getStatusAction = () => {
    switch (auction.status) {
      case 'active':
        return { label: 'Pause Auction', icon: Pause, action: () => handleStatusChange('draft') };
      case 'draft':
        return { label: 'Activate Auction', icon: Play, action: () => handleStatusChange('active') };
      case 'upcoming':
        return { label: 'Cancel Auction', icon: Ban, action: () => handleStatusChange('cancelled') };
      default:
        return null;
    }
  };

  const statusAction = getStatusAction();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Auction
          </DropdownMenuItem>
          
          {statusAction && (
            <DropdownMenuItem onClick={statusAction.action}>
              <statusAction.icon className="h-4 w-4 mr-2" />
              {statusAction.label}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Auction
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Auction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{auction.title}"? This action cannot be undone.
              All bids associated with this auction will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Status Change Confirmation Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Auction Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the auction status to "{targetStatus}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AuctionActions;
