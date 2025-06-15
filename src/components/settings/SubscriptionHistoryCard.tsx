
import React from 'react';
import { Calendar, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

interface SubscriptionHistory {
  id: string;
  program_name: string;
  start_date: string;
  end_date: string;
  status: string;
  payment_status: string;
  created_at: string;
}

interface SubscriptionHistoryCardProps {
  subscriptionHistory: SubscriptionHistory[];
  loadingHistory: boolean;
}

const SubscriptionHistoryCard = ({ subscriptionHistory, loadingHistory }: SubscriptionHistoryCardProps) => {
  const navigate = useNavigate();

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-bold text-lg text-slate-900 px-1 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Subscription History
      </h4>
      <Card className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center text-slate-900">
            <CreditCard className="w-5 h-5 mr-2" />
            Program Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : subscriptionHistory.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No subscription history found</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/subscriptions')}
                className="mt-3"
              >
                Browse Programs
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-left">Program</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptionHistory.map((subscription) => (
                    <TableRow key={subscription.id} className="border-b">
                      <TableCell className="py-4">
                        <div>
                          <p className="font-semibold text-slate-900">{subscription.program_name}</p>
                          <p className="text-sm text-slate-500">
                            Started: {formatDate(subscription.start_date)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {getStatusIcon(subscription.status)}
                            <span className="ml-1 capitalize">{subscription.status}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="text-sm">
                          {subscription.end_date ? (
                            <span className="text-slate-600">
                              Ends: {formatDate(subscription.end_date)}
                            </span>
                          ) : (
                            <span className="text-slate-400">No end date</span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionHistoryCard;
