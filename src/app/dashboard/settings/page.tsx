"use client";

import { Settings, Bell, Shield, Palette, Globe, Database, HelpCircle, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Configure your preferences and system parameters.</p>
      </div>

      <div className="grid gap-8 max-w-4xl">
        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>How you'll be notified about updates and tasks.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive daily summaries and urgent alerts.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator className="bg-accent/50" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Browser Push</Label>
                <p className="text-sm text-muted-foreground">Desktop notifications for real-time ticket updates.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-card rounded-2xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Personalize the look and feel of your dashboard.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Auto Dark Mode</Label>
                <p className="text-sm text-muted-foreground">Automatically switch based on system settings.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button size="lg" className="rounded-xl gap-2 font-bold px-8">
            <Save className="h-5 w-5" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
