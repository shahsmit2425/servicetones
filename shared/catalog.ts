export const categories = [
  "All services",
  "Handyman",
  "Cleaning",
  "Plumbing",
  "Electrical",
  "Painting",
  "Landscaping",
] as const;
export type User = {
  id: string;
  name: string;
  email: string;
  role: "customer" | "pro";
};
export type Pro = {
  id: string;
  name: string;
  business: string;
  category: string;
  bio: string;
  zip: string;
  rate: number;
  rating: number;
  reviews: number;
};
export type Project = {
  id: string;
  customer_id: string;
  pro_id: string | null;
  title: string;
  category: string;
  description: string;
  zip: string;
  status: string;
  created_at: string;
};
export type Conversation = {
  id: string;
  customer_id: string;
  pro_id: string;
  name: string;
  last_message: string | null;
  updated_at: string;
};
export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};
export const samplePros: Pro[] = [
  {
    id: "sample-1",
    name: "Marcus Johnson",
    business: "The Handy Neighbor",
    category: "Handyman",
    bio: "From the little fixes to the weekend to-do list. Thoughtful repairs, assembly, and home improvements.",
    zip: "10001",
    rate: 75,
    rating: 4.9,
    reviews: 128,
  },
  {
    id: "sample-2",
    name: "Sofia Martinez",
    business: "Fresh Start Cleaning",
    category: "Cleaning",
    bio: "A fresh space, a lighter day. Detailed home cleaning with supplies that are gentle on your home.",
    zip: "10001",
    rate: 55,
    rating: 4.9,
    reviews: 96,
  },
  {
    id: "sample-3",
    name: "Daniel Kim",
    business: "Flow Right Plumbing",
    category: "Plumbing",
    bio: "Reliable help for leaks, fixtures, and the unexpected. Clear communication from start to finish.",
    zip: "10001",
    rate: 95,
    rating: 4.8,
    reviews: 84,
  },
  {
    id: "sample-4",
    name: "Alex Rivera",
    business: "Brightline Electric",
    category: "Electrical",
    bio: "Lighting, switches, and everyday electrical projects. Let’s make your home work a little better.",
    zip: "10001",
    rate: 90,
    rating: 4.9,
    reviews: 72,
  },
  {
    id: "sample-5",
    name: "Taylor Brooks",
    business: "Color & Co.",
    category: "Painting",
    bio: "Fresh color and careful preparation for interior spaces, trim, and the details that make a home.",
    zip: "10001",
    rate: 65,
    rating: 4.8,
    reviews: 61,
  },
  {
    id: "sample-6",
    name: "Jordan Lee",
    business: "Yard Theory",
    category: "Landscaping",
    bio: "Seasonal cleanups, garden care, and greener outdoor spaces. Help your yard feel like home.",
    zip: "10001",
    rate: 70,
    rating: 4.9,
    reviews: 53,
  },
];
