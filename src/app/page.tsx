"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [buttonClicked, setButtonClicked] = useState(false);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Basic Test */}
        <Card>
          <CardHeader>
            <CardTitle>Step 2: ShadCN UI Test</CardTitle>
            <CardDescription>
              Testing ShadCN components with Tailwind v3
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you can see this card with proper styling, ShadCN is working!
            </p>
          </CardContent>
        </Card>

        {/* Button Test */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button onClick={() => setButtonClicked(!buttonClicked)}>
                Primary
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>

            {buttonClicked && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">
                  ✅ Button clicked! ShadCN buttons are working.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Input Test */}
        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Type here to test input..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />

            {inputValue && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-700 text-sm">
                  ✅ Input working! You typed: &ldquo;{inputValue}&rdquo;
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Success Status */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <p className="font-semibold text-green-700">
                Step 2 Complete: ShadCN UI + Tailwind v3 Working!
              </p>
            </div>
            <p className="text-green-600 text-sm mt-1">
              Ready to proceed to Step 3: Basic Layout Structure
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
