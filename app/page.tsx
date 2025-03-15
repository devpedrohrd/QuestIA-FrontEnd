'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, School } from 'lucide-react';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export default function Home() {
  const handleGoogleLogin = async () => {
    console.log('Google login clicked');
    window.location.href = 'http://localhost:3334/auth/google';
  };

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold">Quiz Master</CardTitle>
          <CardDescription className="text-xl mt-2">
            Interactive Learning Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Image
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop"
              alt="Learning"
              width={400}
              height={200}
              className="rounded-lg"
            />
          </div>
          <div className="grid gap-4">
            {/* <Button
              size="lg"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <School className="mr-2 h-5 w-5" />
              Login as Student
            </Button> */}
            <Button
              size="lg"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              <GraduationCap className="mr-2 h-5 w-5" />
              Login as Teacher
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}