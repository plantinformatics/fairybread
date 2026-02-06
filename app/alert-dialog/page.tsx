import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AlertDialogPage() {
  return (
    <div className="p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Alert Dialog</h1>
        <p className="text-sm text-muted-foreground">
          Reference page for alert-dialog components and slots.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Default size</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="primary">Open dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogMedia>
                <AlertTriangle />
              </AlertDialogMedia>
              <AlertDialogTitle>Delete this record?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent. You can cancel to keep the record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Small size</h2>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">Open small dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogMedia>
                <CheckCircle2 />
              </AlertDialogMedia>
              <AlertDialogTitle>Changes saved</AlertDialogTitle>
              <AlertDialogDescription>
                Your updates are ready to review. Continue to close this dialog.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel variant="ghost">Close</AlertDialogCancel>
              <AlertDialogAction variant="primary" size="sm">
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
