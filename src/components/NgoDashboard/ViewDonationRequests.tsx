
'use client';

import React from 'react';
import type { DonationRequest, DonationRequestStatus } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertTriangle, CheckCircle, XCircle, Archive, Clock, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


interface ViewDonationRequestsProps {
  requests: DonationRequest[];
  onUpdateStatus: (requestId: string, newStatus: DonationRequestStatus) => void;
  isUpdatingStatus: boolean;
}

export function ViewDonationRequests({ requests, onUpdateStatus, isUpdatingStatus }: ViewDonationRequestsProps) {
  if (requests.length === 0) {
    return (
      <div className="py-8 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-semibold text-foreground/80">
          No Donation Requests Yet
        </p>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          Click &quot;Create New Request&quot; to list medicines your NGO currently needs.
        </p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: DonationRequestStatus) => {
    switch (status) {
      case 'Open': return 'default'; // Primary color
      case 'Fulfilled': return 'secondary'; // Or a success-like color if defined
      case 'Closed': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: DonationRequestStatus) => {
    switch (status) {
      case 'Open': return <Clock className="h-4 w-4 text-primary" />;
      case 'Fulfilled': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Closed': return <Archive className="h-4 w-4 text-muted-foreground" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  }


  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Medicine Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Urgency</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead>Requested On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-medium">{req.medicineName}</TableCell>
              <TableCell>{req.quantityNeeded}</TableCell>
              <TableCell>
                <Badge variant={req.urgency === 'High' ? 'destructive' : req.urgency === 'Medium' ? 'default' : 'secondary' } className="capitalize">
                  {req.urgency}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={getStatusBadgeVariant(req.status)} className="flex items-center gap-1.5 justify-center w-fit mx-auto">
                   {getStatusIcon(req.status)}
                  {req.status}
                </Badge>
              </TableCell>
              <TableCell>{req.createdAt ? format(req.createdAt.toDate(), 'PPp') : 'N/A'}</TableCell>
              <TableCell className="text-right">
                {req.status === 'Open' && (
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdatingStatus}>
                        <span className="sr-only">Open menu</span>
                         {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onUpdateStatus(req.id!, 'Fulfilled')} disabled={isUpdatingStatus}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Fulfilled
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUpdateStatus(req.id!, 'Closed')} disabled={isUpdatingStatus}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Close Request
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                 {(req.status === 'Fulfilled' || req.status === 'Closed') && (
                   <span className="text-xs text-muted-foreground italic">No actions</span>
                 )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
