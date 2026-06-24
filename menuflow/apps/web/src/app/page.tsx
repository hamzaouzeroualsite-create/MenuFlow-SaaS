import Link from 'next/link';
import { QrCode, BarChart3, ShoppingBag, Globe, Shield, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Menu<span className="text-emerald-600">Flow</span></span>
          </div>
          <Link href="/login" className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Connexion
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          La plateforme SaaS premium<br />
          <span className="text-emerald-600">pour restaurants au Maroc</span>
        </h1>
        <p className="text-xl text-gray-500 mt-6 max-w-2xl mx-auto">
          Menus digitaux, commandes en temps réel, QR codes, analytics et gestion complète — tout en un.
        </p>
        <div className="flex gap-4 justify-center mt-10">
          <Link href="/r/le-gourmet" className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 flex items-center gap-2">
            Voir la démo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="px-8 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50">
            Accès restaurant
          </Link>
        </div>
      </section>

      <section className="bg-[#F9FAFB] py-20">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: QrCode, title: 'QR Codes', desc: 'Menus digitaux accessibles en un scan' },
            { icon: ShoppingBag, title: 'Commandes temps réel', desc: 'Suivi instantané des commandes' },
            { icon: BarChart3, title: 'Analytics', desc: 'Insights détaillés sur votre activité' },
            { icon: Globe, title: 'Multi-langue', desc: 'Arabe, Français et Anglais' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> MenuFlow © 2026
          </div>
          <p>Plateforme gérée par MenuFlow — Restaurants partenaires uniquement</p>
        </div>
      </footer>
    </div>
  );
}
