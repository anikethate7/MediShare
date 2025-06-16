import { Boxes, Handshake } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="mb-12 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
        <Boxes className="h-12 w-12 text-primary" />
      </div>
      <h2 className="text-4xl font-headline font-bold mb-4 text-primary">
        Welcome to MediShare
      </h2>
      <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-6">
        Turn your unused medicines into a lifeline for those in need. MediShare connects you with NGOs and healthcare centers, making donations simple, impactful, and local.
      </p>
      <div className="flex justify-center items-center gap-2 text-accent">
        <Handshake className="h-6 w-6" />
        <p className="font-semibold">Join us in building a healthier community, one donation at a time.</p>
      </div>
    </section>
  );
}
