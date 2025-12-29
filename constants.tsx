
import React from 'react';
import { Event, UserRole } from './types';
import { Calendar, Music, Laptop, Palette, Trophy, Utensils } from 'lucide-react';

export const COLORS = {
  primary: '#3b82f6', // Professional Blue
  secondary: '#1e293b', 
  accent: '#f59e0b', 
};

export const BrandIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <div className={`${className} bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20`}>
    <Calendar className="text-white w-2/3 h-2/3" />
  </div>
);

export const CAROUSEL_SLIDES = [
  {
    title: "Legendary Concerts",
    desc: "Experience the pulse of the city with front-row access to the world's best performers.",
    image: "https://images.unsplash.com/photo-1459749411177-042180ceea73?auto=format&fit=crop&q=80&w=1200",
    color: "from-purple-600 to-blue-600"
  },
  {
    title: "Tech Innovation",
    desc: "Join the summits shaping our future. Meet world-class engineers and visionaries.",
    image: "https://images.unsplash.com/photo-1540575861501-7ad060e29ad3?auto=format&fit=crop&q=80&w=1200",
    color: "from-blue-600 to-cyan-500"
  },
  {
    title: "Masterclass Series",
    desc: "Unlock new skills with curated workshops led by industry-leading professionals.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
    color: "from-emerald-600 to-teal-500"
  }
];

export const CATEGORIES = [
  { id: 'concert', label: 'Concerts', icon: <Music size={18}/> },
  { id: 'tech', label: 'Tech Meetups', icon: <Laptop size={18}/> },
  { id: 'workshop', label: 'Workshops', icon: <Palette size={18}/> },
  { id: 'sport', label: 'Sports', icon: <Trophy size={18}/> },
  { id: 'food', label: 'Food Festivals', icon: <Utensils size={18}/> },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    businessId: 'u2',
    title: 'Neon Nights Concert',
    description: 'A futuristic musical journey under the city lights with local indie bands.',
    category: 'concert',
    price: 49.99,
    date: '2024-10-15',
    location: { lat: 40.7128, lng: -74.0060, address: 'Madison Square Garden, NYC' },
    images: ['https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=800'],
    status: 'ACTIVE',
    rating: 4.9,
    totalSeats: 200,
    soldSeats: 145,
    allowNegotiation: true
  },
  {
    id: 'e2',
    businessId: 'u2',
    title: 'AI Revolution Summit',
    description: 'Exploring the future of generative models and the impact on creative industries.',
    category: 'tech',
    price: 299.00,
    date: '2024-11-05',
    location: { lat: 37.7749, lng: -122.4194, address: 'Convention Center, SF' },
    images: ['https://images.unsplash.com/photo-1540575861501-7ad060e29ad3?auto=format&fit=crop&q=80&w=800'],
    status: 'ACTIVE',
    rating: 4.7,
    totalSeats: 500,
    soldSeats: 480,
    allowNegotiation: false
  },
  {
    id: 'e3',
    businessId: 'u3',
    title: 'Digital Art Workshop',
    description: 'Learn procreate and photoshop from industry masters in this 2-day session.',
    category: 'workshop',
    price: 85.00,
    date: '2024-10-22',
    location: { lat: 34.0522, lng: -118.2437, address: 'The Artsy Loft, LA' },
    images: ['https://images.unsplash.com/photo-1460666819451-7410977a63d6?auto=format&fit=crop&q=80&w=800'],
    status: 'ACTIVE',
    rating: 4.8,
    totalSeats: 30,
    soldSeats: 12,
    allowNegotiation: true
  }
];
