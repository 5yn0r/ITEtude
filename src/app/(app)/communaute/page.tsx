
'use client';

import { AppHeader } from "@/components/app-header";
import { useUser, useFirestore } from "@/firebase";
import { useCollection } from "@/firebase/firestore/use-collection";
import { addDoc, collection, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2, Users as UsersIcon, MessageCircle, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/utils";

type Message = {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL: string;
  createdAt: any;
};

export default function CommunityPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Utilisation d'une collection dédiée pour les messages communautaires
  const { data: messages, loading } = useCollection<Message>('community_messages');

  const sortedMessages = [...messages].sort((a, b) => 
    (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)
  );

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [sortedMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !firestore || isSending) return;

    setIsSending(true);
    const messageData = {
      text: newMessage.trim(),
      userId: user.uid,
      userName: user.displayName || "Anonyme",
      userPhotoURL: user.photoURL || "",
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(firestore, 'community_messages'), messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <AppHeader title="Communauté ITEtude" />
      <main className="flex-1 flex flex-col min-h-0 bg-secondary/30">
        <div className="flex-1 overflow-hidden p-4 md:p-6 lg:px-8">
          <div className="max-w-4xl mx-auto h-full flex flex-col bg-card rounded-2xl shadow-sm border overflow-hidden">
            {/* Header de la discussion */}
            <div className="p-4 border-b bg-muted/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <UsersIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Salon Principal</h3>
                  <p className="text-xs text-muted-foreground">Discutez avec tous les apprenants</p>
                </div>
              </div>
            </div>

            {/* Bandeau WhatsApp pour les nouveaux arrivants */}
            {showBanner && (
              <div className="p-3 bg-green-500/10 border-b flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full shrink-0">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800">Nouveau sur la plateforme ?</p>
                    <p className="text-xs text-green-700/80">Rejoignez aussi notre groupe WhatsApp ITEtude pour des échanges instantanés !</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700 text-white rounded-full">
                    <a href="https://chat.whatsapp.com/BSNQKeLK9DB8ziRajJimTv?mode=gi_t" target="_blank" rel="noopener noreferrer">
                      Rejoindre
                    </a>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-green-700/50 hover:text-green-700 hover:bg-green-500/10" onClick={() => setShowBanner(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Zone de messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="mt-2 text-sm text-muted-foreground">Chargement des discussions...</p>
                </div>
              ) : sortedMessages.length > 0 ? (
                <div className="space-y-6">
                  {sortedMessages.map((msg, index) => {
                    const isOwnMessage = msg.userId === user?.uid;
                    const showHeader = index === 0 || sortedMessages[index - 1].userId !== msg.userId;

                    return (
                      <div 
                        key={msg.id} 
                        className={cn(
                          "flex items-start gap-3",
                          isOwnMessage ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {!isOwnMessage && showHeader && (
                          <Avatar className="w-8 h-8 mt-1 shrink-0">
                            <AvatarImage src={msg.userPhotoURL} />
                            <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )}
                        {!isOwnMessage && !showHeader && <div className="w-8 shrink-0" />}

                        <div className={cn(
                          "flex flex-col max-w-[75%] sm:max-w-[60%]",
                          isOwnMessage ? "items-end" : "items-start"
                        )}>
                          {showHeader && (
                            <span className="text-[10px] font-bold text-muted-foreground mb-1 px-1">
                              {isOwnMessage ? "Vous" : msg.userName}
                            </span>
                          )}
                          <div className={cn(
                            "px-4 py-2 rounded-2xl text-sm shadow-sm",
                            isOwnMessage 
                              ? "bg-primary text-primary-foreground rounded-tr-none" 
                              : "bg-muted rounded-tl-none"
                          )}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-muted-foreground mt-1 px-1">
                            {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm', { locale: fr }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <p className="text-muted-foreground">Soyez le premier à envoyer un message !</p>
                </div>
              )}
            </ScrollArea>

            {/* Input d'envoi */}
            <div className="p-4 border-t bg-muted/10">
              <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  className="flex-1 rounded-full bg-background"
                  maxLength={1000}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full shrink-0"
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
