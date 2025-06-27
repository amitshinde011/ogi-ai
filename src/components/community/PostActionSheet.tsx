
import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

interface PostActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PostActionSheet: React.FC<PostActionSheetProps> = ({
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = () => {
    onClose();
    setShowDeleteConfirm(true);
  };

  const handleEdit = () => {
    onClose();
    onEdit();
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle>Post Options</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col space-y-2 mt-4">
            <Button
              variant="ghost"
              onClick={handleEdit}
              className="flex items-center justify-start space-x-3 h-12"
            >
              <Pencil size={20} />
              <span>Edit</span>
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              className="flex items-center justify-start space-x-3 h-12 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 size={20} />
              <span>Delete</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
