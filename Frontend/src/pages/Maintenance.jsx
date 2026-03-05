import { Wrench } from 'lucide-react';
import { Button } from "@/components/ui/forms";

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-muted/30 p-8 rounded-3xl border border-border/50 max-w-md w-full">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Wrench className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="text-3xl font-serif font-bold mb-4">Under Maintenance</h1>
        
        <p className="text-muted-foreground mb-8">
          We are currently performing scheduled maintenance to improve your experience. 
          Please check back soon.
        </p>
        
        <div className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Jagannath Darshan Yatra. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
