import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ isOpen, onClose }: DeleteAccountModalProps) => {
  const [step, setStep] = useState<'warning' | 'password' | 'confirmation'>('warning');
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleClose = () => {
    if (!isDeleting) {
      setStep('warning');
      setPassword('');
      setConfirmationText('');
      onClose();
    }
  };

  const proceedToPassword = () => {
    setStep('password');
  };

  const verifyPassword = async () => {
    if (!password.trim()) {
      toast({
        title: "Password required",
        description: "Please enter your current password to proceed.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verify password by attempting to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: password
      });

      if (error) {
        toast({
          title: "Invalid password",
          description: "The password you entered is incorrect.",
          variant: "destructive"
        });
        return;
      }

      setStep('confirmation');
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "Unable to verify your password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteAccount = async () => {
    if (confirmationText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' exactly to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error",
        description: "Unable to identify user. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);

    try {
      // Call the database function to delete the account
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: user.id
      });

      if (error) {
        console.error('Delete account error:', error);
        toast({
          title: "Deletion failed",
          description: error.message || "Failed to delete account. Please try again.",
          variant: "destructive"
        });
        setIsDeleting(false);
        return;
      }

      if (data && typeof data === 'object' && 'success' in data && !data.success) {
        toast({
          title: "Deletion failed",
          description: (data as any).message || "Failed to delete account. Please try again.",
          variant: "destructive"
        });
        setIsDeleting(false);
        return;
      }

      // Account deleted successfully - sign out and redirect
      toast({
        title: "Account deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      // Sign out and redirect to login
      await signOut();
      navigate('/login');
      
    } catch (error) {
      console.error('Unexpected error during account deletion:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      setIsDeleting(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 'warning':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-800">This action cannot be undone</h4>
                <p className="text-sm text-red-700">
                  Deleting your account will permanently remove all your data.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">What will be deleted:</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  Your profile information and settings
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  All wellness tracking data (meals, water, steps, meditation)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  Your subscription history and assessments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  All posts, comments, and community interactions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  Saved recipes and video progress
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                  All messages and notifications
                </li>
              </ul>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={proceedToPassword}
                variant="destructive"
                className="flex-1"
                disabled={isDeleting}
              >
                Continue with Deletion
              </Button>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password">Enter your current password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Current password"
                className="w-full"
                disabled={isDeleting}
              />
              <p className="text-sm text-slate-600">
                We need to verify your identity before proceeding with account deletion.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                onClick={() => setStep('warning')}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Back
              </Button>
              <Button
                onClick={verifyPassword}
                variant="destructive"
                className="flex-1"
                disabled={isDeleting || !password.trim()}
              >
                Verify Password
              </Button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h4 className="font-semibold text-red-800">Final confirmation required</h4>
              </div>
              <p className="text-sm text-red-700">
                This is your last chance to cancel. Once confirmed, your account and all data will be permanently deleted.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Type "DELETE" to confirm</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full"
                disabled={isDeleting}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                onClick={() => setStep('password')}
                variant="outline"
                className="flex-1"
                disabled={isDeleting}
              >
                Back
              </Button>
              <Button
                onClick={deleteAccount}
                variant="destructive"
                className="flex-1"
                disabled={isDeleting || confirmationText !== 'DELETE'}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting Account...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete My Account
                  </>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'warning':
        return 'Delete Account';
      case 'password':
        return 'Verify Identity';
      case 'confirmation':
        return 'Final Confirmation';
      default:
        return 'Delete Account';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 'warning':
        return 'Please review what will be permanently deleted from your account.';
      case 'password':
        return 'Enter your password to verify your identity.';
      case 'confirmation':
        return 'Type "DELETE" to permanently delete your account.';
      default:
        return 'Permanently delete your account and all associated data.';
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900">
              {getStepTitle()}
            </AlertDialogTitle>
            {!isDeleting && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <AlertDialogDescription className="text-slate-600">
            {getStepDescription()}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {getStepContent()}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountModal;