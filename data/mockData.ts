import { Dish, Post } from '../types';

export const topDishes: Dish[] = [
  {
    id: 1,
    name: 'Top 1',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    likes: 10000,
  },
  {
    id: 2,
    name: 'Top 2',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    likes: 9000,
  },
  {
    id: 3,
    name: 'Top 3',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    likes: 1000,
  },
  {
    id: 4,
    name: 'Top 4',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    likes: 900,
  },
];

export const posts: Post[] = [
  {
    id: 1,
    author: 'Let him cook',
    dishName: 'Phở bò truyền thống',
    timeAgo: '2 giờ trước',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    description: 'Nước dùng đậm đà, thịt bò mềm thơm, ăn kèm rau thơm tươi.',
    likes: 123,
    comments: 123,
    duration: 45,
  },
  {
    id: 2,
    author: 'cook',
    dishName: 'Phở bò truyền thống',
    timeAgo: '3 giờ trước',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400',
    description: 'Nước dùng đậm đà',
    likes: 98,
    comments: 45,
    duration: 40,
  },
];