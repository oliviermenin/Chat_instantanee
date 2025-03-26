"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, User } from 'lucide-react';

type UserNameModalProps = {
  onSubmit: (username: string) => void;
};

export default function UserNameModal({ onSubmit }: UserNameModalProps) {
  const [username, setUsername] = useState("");
  const [open, setOpen] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError("Veuillez entrer un nom d'utilisateur");
      return;
    }
    
    if (trimmedUsername.length < 2) {
      setError("Le nom doit contenir au moins 2 caractères");
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError("Le nom ne doit pas dépasser 20 caractères");
      return;
    }
    
    onSubmit(trimmedUsername);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !username.trim()) {
        return;
      }
      setOpen(isOpen);
    }}>
      <DialogContent className="sm:max-w-[425px] border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
          <MessageCircle className="h-10 w-10 text-white" />
        </div>
        
        <DialogHeader className="pt-8 pb-2">
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Bienvenue
          </DialogTitle>
          <DialogDescription className="text-center">
            Entrez votre nom pour rejoindre la discussion en temps réel.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  placeholder="Votre nom"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  className="pl-10 bg-gray-50 border-gray-200 focus:ring-violet-500 focus:border-violet-500"
                  autoFocus
                  maxLength={20}
                />
              </div>
              {error && (
                <p className="text-sm text-rose-500 pl-1">{error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white"
            >
              Rejoindre le chat
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}