import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/journal');
  return null; // Tidak perlu render apa pun karena sudah redirect
}
