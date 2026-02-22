// pages/StoriesPage.jsx
import { MainLayout } from "../layout/MainLayout.jsx";
export default function StoriesPage() {
  return (
    <MainLayout title="StoriesPage">
      <div className="flex items-center justify-center h-96">
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-display text-3xl text-gold mb-2">StoriesPage</p>
          <p className="text-cream/40">Coming soon…</p>
        </div>
      </div>
    </MainLayout>
  );
}
